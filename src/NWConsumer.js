import R from "ramda";
import { Subject } from "rx";
import urlUtil from "url";
import fetch from "node-fetch";
import zlib from "mz/zlib";
import encodeForm from "form-urlencoded";
import createDebug from "debug";

import TaskQueue from "./TaskQueue";
import DBCache from "./db";

const debug = createDebug("sa:Submitter");

const DEFAULT_TIMEOUT = 10000;
const MODES = {
  track: {
    debug: false,
    dryRun: false,
  },
  debug: {
    debug: true,
    dryRun: false,
  },
  dryRun: {
    debug: true,
    dryRun: true,
  },

  debug_off: {
    debug: false,
    dryRun: false,
  },
  debug_and_track: {
    debug: true,
    dryRun: false,
  },
  debug_only: {
    debug: true,
    dryRun: true,
  },
};

class NWConsumer extends Subject {
  static composeDebugUrl(url) {
    return urlUtil.format(
      R.merge(urlUtil.parse(url), {
        pathname: "/debug",
      })
    );
  }

  constructor({
    url,
    cachePath,
    gzip = true,
    mode = "track",
    timeout = DEFAULT_TIMEOUT,
  }) {
    super();

    if (typeof arguments[0] === "string") {
      url = arguments[0];
    }

    if (url == null) {
      throw new Error("Url is not provided");
    }

    if (cachePath == null) {
      throw new Error("CachePath is not provided");
    }

    if (MODES[mode] == null) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    Object.assign(
      this,
      {
        url,
        cachePath,
        gzip,
        timeout,
      },
      MODES[mode]
    );

    if (this.debug) {
      this.url = NWConsumer.composeDebugUrl(url);
    }

    debug("Config: %o", this);
    this.db = new DBCache(cachePath);
    this.dataQueue = new TaskQueue({
      consumeData: this.submit.bind(this),
      onSucceeded: () => {
        super.onNext(null);
      },
      onError: this.onError.bind(this),
    });
    this.pushCache();
  }

  catch(callback) {
    debug("Error:");
    this.subscribe(R.identity, callback, R.identity);
  }

  onNext(data) {
    debug("onNext(%o)", data);

    this.dataQueue.enqueueAndStart(data);
  }

  async pushCache() {
    this.db.uploadCache(
      async (message) => {
        try {
          var re = await this.submit(message);
          return re || false;
        } catch (err) {
          debug(err);
        }
        return false;
      });
  }


  async submit(data) {
    if (data == null) {
      debug("Skiped due to empty data");
      return;
    }

    let message;

    if (data._id && data.message) {
      message = JSON.parse(data.message);
    } else {
      message = data;
    }

    const messages = Array.isArray(message) ? message : [message];

    if (messages.length === 0) {
      debug("Skiped due to empty batch data");
      return;
    }

    debug("submit(%j)", messages);
    const payloadText = new Buffer(JSON.stringify(messages), "utf8");
    const dataListBuffer = await (this.gzip
      ? zlib.gzip(payloadText)
      : payloadText);
    const body = encodeForm({
      data_list: dataListBuffer.toString("base64"),
      gzip: this.gzip ? 1 : 0,
    });

    const headers = {
      "User-Agent": "SensorsAnalytics Node SDK",
      "Content-Type": "application/x-www-form-urlencoded",
      "Dry-Run": this.dryRun ? "true" : undefined,
    };

    debug("Post to %s", this.url);
    debug("Headers: %o", headers);
    debug("Body: %o", body);

    debug("Posting...");
    return fetch(this.url, {
      method: "POST",
      headers,
      body,
      timeout: this.timeout,
    })
      .then((response) => {
        debug("Post complete");
        if (response.ok) {
          debug("Suceeded: %d", response.status);
          if (data._id && data.message) {
            this.db.deleteEvent(data);
          }
          return true;
        }

        debug("Error: %s", response.status);
        if (!(data._id && data.message)) {
          this.db.cacheLog(JSON.stringify(data));
        }
        if (this.debug && messages.count > 1 && response.status === 400) {
          debug("Batch mode is not supported in debug");
          throw new Error("Batch mode is not supported in Debug");
        }

        return response.text().then().catch((errorMessage) => {
          throw new Error(errorMessage);
        });
      })
      .catch((err) => {
        if (!(data._id && data.message)) {
          this.db.cacheLog(JSON.stringify(data));
        }
        debug(`timeout: ${err}`);
      });
  }
}

export default NWConsumer;
