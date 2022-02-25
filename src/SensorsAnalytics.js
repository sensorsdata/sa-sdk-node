import R from "ramda";
import { Subject } from "rx";

import createDebug from "debug";
import {
  pascal2Snake,
  snakenizeKeys,
  extractTimestamp,
  extractCodeProperties,
  translateUserAgent,
} from "./translators";
import { version as PACKAGE_VERSION } from "./readPackageInfo";
import {
  checkExists,
  checkPattern,
  checkIsStringArray,
  checkProperties,
  checkValueType,
  checkValueIsNumber,
  checkValueIsStringArray,
} from "./assertions";
import Submitter from "./Submitter";
import LoggingConsumer from "./LoggingConsumer";
import NWConsumer from "./NWConsumer";

const debug = createDebug("sa:SensorsAnalytics");

const SDK_PROPERTIES = {
  $lib: "Node",
  $libVersion: PACKAGE_VERSION,
};

class SensorsAnalytics extends Subject {
  constructor() {
    super();
    this.logger = null;
    this.loggingConsumer = false;
    this.clearSuperProperties();
  }

  disableLoggingConsumer() {
    this.loggingConsumer = false;
  }

  enableLoggingConsumer() {
    this.loggingConsumer = true;
  }

  registerSuperProperties(values = {}) {
    debug("registerSuperProperties(%j)", values);
    checkProperties(values, checkPattern);
    checkProperties(values, checkValueType);

    return Object.assign(this.superProperties, values);
  }

  clearSuperProperties() {
    debug("clearSuperProperties()");

    this.superProperties = {};

    return this.superProperties;
  }

  disableReNameOption() {
    debug("resetReNameOption()");

    this.allowReNameOption = false;

    return this.allowReNameOption;
  }

  enableReNameOption() {
    debug("resetReNameOption()");

    this.allowReNameOption = true;

    return this.allowReNameOption;
  }

  superizeProperties(properties = {}, callIndex) {
    // 合并公共属性
    const codeProperties = extractCodeProperties(callIndex);
    return {
      properties: R.mergeAll([
        this.superProperties,
        translateUserAgent(properties),
      ]),
      lib: snakenizeKeys(
        R.mergeAll([
          SDK_PROPERTIES,
          codeProperties,
          {
            $app_version:
              this.superProperties.$app_version ||
              this.superProperties.$appVersion ||
              properties.$app_version ||
              properties.$appVersion,
          },
        ])
      ),
    };
  }

  track(distinctId, event, eventProperties) {
    debug("track(%j)", {
      distinctId,
      event,
      eventProperties,
    });

    checkExists(distinctId, "distinctId");
    checkPattern(event, "event");
    checkProperties(eventProperties, checkValueType);

    const superize = this.superizeProperties(eventProperties, 4);

    this.internalTrack("track", {
      event,
      distinctId,
      properties: R.mergeAll([
        snakenizeKeys(SDK_PROPERTIES),
        superize.properties,
      ]),
      lib: superize.lib,
    });
  }

  trackSignup(distinctId, originalId, eventProperties) {
    debug("trackSignup(%j)", {
      distinctId,
      originalId,
      eventProperties,
    });

    checkExists(distinctId, "distinctId");
    checkExists(originalId, "originalId");
    checkProperties(eventProperties, checkValueType);

    const superize = this.superizeProperties(eventProperties, 4);

    this.internalTrack("track_signup", {
      event: "$SignUp",
      distinctId,
      originalId,
      properties: R.mergeAll([
        snakenizeKeys(SDK_PROPERTIES),
        superize.properties,
      ]),
      lib: superize.lib,
    });
  }

  profileSet(distinctId, properties) {
    debug("profileSet(%j)", {
      distinctId,
      properties,
    });

    checkExists(distinctId, "distinctId");
    checkProperties(properties, checkValueType);

    const superize = this.superizeProperties(properties, 4);

    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")
    ) {
      delete superize.properties.$app_version;
    }
    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")
    ) {
      delete superize.properties.$appVersion;
    }

    this.internalTrack("profile_set", {
      distinctId,
      properties: superize.properties,
      lib: superize.lib,
    });
  }

  profileSetOnce(distinctId, properties) {
    debug("profileSetOnce(%j)", {
      distinctId,
      properties,
    });

    checkExists(distinctId, "distinctId");
    checkProperties(properties, checkValueType);

    const superize = this.superizeProperties(properties, 4);

    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")
    ) {
      delete superize.properties.$app_version;
    }
    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")
    ) {
      delete superize.properties.$appVersion;
    }

    this.internalTrack("profile_set_once", {
      distinctId,
      properties: superize.properties,
      lib: superize.lib,
    });
  }

  profileIncrement(distinctId, properties) {
    debug("profileIncrement(%j)", {
      distinctId,
      properties,
    });

    checkExists(distinctId, "distinctId");
    checkProperties(properties, checkValueIsNumber);

    const superize = this.superizeProperties(properties, 4);

    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")
    ) {
      delete superize.properties.$app_version;
    }
    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")
    ) {
      delete superize.properties.$appVersion;
    }

    this.internalTrack("profile_increment", {
      distinctId,
      properties,
      lib: superize.lib,
    });
  }

  profileAppend(distinctId, properties) {
    debug("profileAppend(%j)", {
      distinctId,
      properties,
    });

    checkExists(distinctId, "distinctId");
    checkProperties(properties, checkValueIsStringArray);

    const superize = this.superizeProperties(properties, 4);

    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")
    ) {
      delete superize.properties.$app_version;
    }
    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")
    ) {
      delete superize.properties.$appVersion;
    }

    this.internalTrack("profile_append", {
      distinctId,
      properties,
      lib: superize.lib,
    });
  }

  profileUnset(distinctId, keys = []) {
    debug("profileUnset(%j)", {
      distinctId,
      keys,
    });

    checkExists(distinctId, "distinctId");
    checkIsStringArray(keys, "Keys");

    const properties = R.zipObj(keys, R.repeat(true, keys.length));

    const superize = this.superizeProperties(properties, 4);

    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$app_version")
    ) {
      delete superize.properties.$app_version;
    }
    if (
      Object.prototype.hasOwnProperty.call(superize.properties, "$appVersion")
    ) {
      delete superize.properties.$appVersion;
    }

    this.internalTrack("profile_unset", {
      distinctId,
      properties,
      lib: superize.lib,
    });
  }

  itemSet(itemType, itemId, properties) {
    debug("itemSet(%j)", {
      itemType,
      itemId,
      properties,
    });

    checkPattern(itemType, "itemType");
    checkExists(itemId, "itemId");
    checkProperties(properties, checkValueType);
    const superize = this.superizeProperties(properties, 4);
    this.internalTrack("item_set", {
      itemType,
      itemId,
      properties,
      lib: superize.lib,
    });
  }

  itemDelete(itemType, itemId) {
    debug("itemDelete(%j)", {
      itemType,
      itemId,
    });
    
    checkPattern(itemType, "itemType");
    checkExists(itemId, "itemId");
    const superize = this.superizeProperties({}, 4);
    this.internalTrack("item_delete", {
      itemType,
      itemId,
      properties: {},
      lib: superize.lib,
    });
  }

  internalTrack(
    type,
    { event, distinctId, originalId, itemType, itemId, properties, lib }
  ) {
    if (this.allowReNameOption) {
      properties = snakenizeKeys(properties);
      event = pascal2Snake(event);
    }
    const envelope = snakenizeKeys({
      _track_id: parseInt(
        Math.random() * (9999999999 - 999999999 + 1) + 999999999,
        10
      ),
      type,
      event,
      time: extractTimestamp(properties),
      distinctId,
      originalId,
      itemType,
      itemId,
      properties: checkProperties(properties, checkPattern),
      lib,
    });

    debug("envelope: %j", envelope);

    if (this.loggingConsumer) {
      this.logger.send(envelope);
    } else {
      this.onNext(envelope);
    }
  }

  inBatch({ count, timeSpan }) {
    const mode = `${count != null ? "count" : ""}${
      timeSpan != null ? "time" : ""
    }`;

    debug("inBatch(%j)", {
      count,
      timeSpan,
      mode,
    });

    switch (mode) {
      case "count":
        return this.bufferWithCount(count).filter(
          (events) => events.length > 0
        );
      case "counttime":
        return this.bufferWithTimeOrCount(timeSpan, count).filter(
          (events) => events.length > 0
        );
      case "time":
        return this.bufferWithTime(timeSpan).filter(
          (events) => events.length > 0
        );
      default:
        return this;
    }
  }

  submitTo(options, batchOptions = {}) {
    debug("submitTo(%j, %j)", options, batchOptions);

    if (global.isRunSubmitTo) {
      return;
    }

    const observable = this.inBatch(batchOptions);
    const submitter = new Submitter(options);
    
    global.isRunSubmitTo = true;

    observable.subscribe(submitter);

    return submitter;
  }

  initNWConsumer(options, batchOptions = {}) {
    debug("initNWConsumer(%j, %j)", options, batchOptions);

    const observable = this.inBatch(batchOptions);
    const submitter = new NWConsumer(options);

    observable.subscribe(submitter);

    return submitter;
  }

  initLoggingConsumer(path, pm2Mode) {
    this.enableLoggingConsumer();
    this.logger = new LoggingConsumer(path, pm2Mode);
  }

  close() {
    this.onCompleted();
    this.logger.close();
  }
}

export default SensorsAnalytics;
