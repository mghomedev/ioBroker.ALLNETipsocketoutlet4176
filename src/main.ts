/*
 * Created with @iobroker/create-adapter v1.16.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core"); // Get common adapter utils

import {
  ALLNETipsocketoutlet4176,
  ALLNETipsocketoutlet4176Actor
} from "./lib/allnetipsocketoutlet4176";
import { isNullOrUndefined } from "util";

// Load your modules here, e.g.:
// import * as fs from "fs";

// Augment the adapter.config object with the actual types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ioBroker {
    interface AdapterConfig {
      // Define the shape of your options here (recommended)
      allnetdeviceurl: string;
      allnetdeviceusername: string;
      allnetdevicepassword: string;
      syncseconds: number;
      testOnStartup: boolean;
      testOnStartupInvertSwitches: boolean;
      debugVerboseAdapterConnectionInfo: boolean;

      // Or use a catch-all approach
      [key: string]: any;
    }
  }
}

class Allnetipsocketoutlet4176 extends utils.Adapter {
  public constructor(options: Partial<ioBroker.AdapterOptions> = {}) {
    super({
      ...options,
      name: "allnetipsocketoutlet4176"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("objectChange", this.onObjectChange.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    // this.on("message", this.onMessage.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }

  /**
   * Is called when databases are connected and adapter received configuration.
   */
  private async onReady(): Promise<void> {
    // Initialize your adapter here

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // this.config:
    this.log.info("config allnetdevicehost: " + this.config.allnetdeviceurl);
    this.log.info(
      "config allnetdeviceusername: " + this.config.allnetdeviceusername
    );

    this.log.info("creating ALLNETipsocketoutlet4176 class ...");
    this._allnet = new ALLNETipsocketoutlet4176(
      this.config.allnetdeviceurl,
      this.config.allnetdeviceusername,
      this.config.allnetdevicepassword
    );

    this._allnet.debugOutputXML = this.config.debugVerboseAdapterConnectionInfo;

    if (this._allnet.debugOutputXML) {
      this._allnet.error = this.log.error;
      this._allnet.debug = this.log.debug;
    }

    if (this.config.testOnStartup) {
      await this._allnet.triggerUpdateAllStates();
      if (this.config.testOnStartupInvertSwitches) {
        for (var a of this._allnet.actors) {
          if (a.id != null) {
            let switchTo = !a.state;
            await this._allnet.triggerSetActorState(a.id, switchTo);
          }
        }
      }

      await this.createAllAdapterStatesFromCurrentAllNetObject();
    }

    /*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
    await this.setObjectAsync("timerIsRunning", {
      type: "state",
      common: {
        name: "timerIsRunning",
        type: "boolean",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    await this.setStateAsync("timerIsRunning", { val: false, ack: true });

    await this.createChannel("", "sensors");
    await this.createChannel("", "actors");

    // in this template all states changes inside the adapters namespace are subscribed
    this.subscribeStates("*");

    /*await*/ this.initTimer();
  }

  private /*async*/ initTimer() {
    if (this._timer == null) {
      this._timer = setTimeout(() => {
        this._timer = null;
        this.onTimerTick();
      }, this.config.syncseconds * 1000);
      /*await*/ this.setStateAsync("timerIsRunning", { val: true, ack: true });
    }
  }

  private destroyTimer() {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this.setStateAsync("timerIsRunning", { val: false, ack: true });
      this._timer = null;
    }
  }

  private async createAllAdapterStatesFromCurrentAllNetObject() {
    var allnet = this._allnet;
    if (allnet == null || allnet.actors == null || allnet.sensors == null)
      return;

    if (allnet.sensors.length == 0 && allnet.actors.length == 0) return;

    let adapterPrefix = this.name + "." + this.instance;
    this.log.info(
      "createAllAdapterStatesFromCurrentAllNetObject for ALLNETadapter=" +
        adapterPrefix
    );

    await this.createState(
      "",
      "",
      "device_name",
      {
        name: "device_name",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device name"
      },
      () => {
        if (allnet != null && allnet.device_name != null) {
          this.setStateAsync(adapterPrefix + ".device_name", {
            val: allnet.device_name,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "device_date",
      {
        name: "device_date",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device name"
      },
      () => {
        if (allnet != null && allnet.device_date != null) {
          this.setStateAsync(adapterPrefix + ".device_date", {
            val: allnet.device_date,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "device_uptime",
      {
        name: "device_uptime",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device Uptime"
      },
      () => {
        if (allnet != null && allnet.device_uptime != null) {
          this.setStateAsync(adapterPrefix + ".device_uptime", {
            val: allnet.device_uptime,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "firmware",
      {
        name: "firmware",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device Firwmare"
      },
      () => {
        if (allnet != null && allnet.firmware != null) {
          this.setStateAsync(adapterPrefix + ".firmware", {
            val: allnet.firmware,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "hardware_model",
      {
        name: "hardware_model",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device Hardware Model"
      },
      () => {
        if (allnet != null && allnet.hardware_model != null) {
          this.setStateAsync(adapterPrefix + ".hardware_model", {
            val: allnet.hardware_model,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "hardware_revision",
      {
        name: "hardware_revision",
        def: "",
        type: "string",
        read: true,
        write: false,
        role: "value",
        desc: "Device Hardware Revision"
      },
      () => {
        if (allnet != null && allnet.hardware_revision != null) {
          this.setStateAsync(adapterPrefix + ".hardware_revision", {
            val: allnet.hardware_revision,
            ack: true
          });
        }
      }
    );

    await this.createState(
      "",
      "",
      "triggerForceRefresh",
      {
        name: "triggerForceRefresh",
        def: undefined,
        type: "boolean",
        read: false,
        write: true,
        role: "switch",
        desc: "Trigger reading data from device and update states"
      },
      () => {
        if (allnet != null) {
          // doesnt make sense here to update  allnet.triggerUpdateAllStates();
        }
      }
    );

    for (var aiter of allnet.actors) {
      let a = aiter; // make copy against function capturing "closure" issue in for loops
      if (a.id == null || a.id.length == 0) continue;

      await this.createState(
        "",
        "actors",
        "actor_" + a.id + "_id",
        {
          name: "actor_" + a.id + "_id",
          def: a.id ? a.id : "",
          type: "string",
          read: true,
          write: false,
          role: "value",
          desc: "Actor id"
        },
        () => {
          this.log.debug(
            "createStateCallBack for a.id=" + a.id + " for id=" + a.id
          );
          if (a.id) {
            this.setStateAsync(
              adapterPrefix + ".actors.actor_" + a.id + "_id",
              {
                val: a.id,
                ack: true
              }
            );
          }
        }
      );

      await this.createState(
        "",
        "actors",
        "actor_" + a.id + "_name",
        {
          name: "actor_" + a.id + "_name",
          def: a.name ? a.name : "",
          type: "string",
          read: true,
          write: false,
          role: "value",
          desc: "Actor name"
        },
        () => {
          this.log.debug(
            "createStateCallBack for a.id=" + a.id + " for name=" + a.name
          );
          if (a.name) {
            this.setStateAsync(
              adapterPrefix + ".actors.actor_" + a.id + "_name",
              {
                val: a.name,
                ack: true
              }
            );
          }
        }
      );

      await this.createState(
        "",
        "actors",
        "actor_" + a.id + "_state",        
        {
          name: "actor_" + a.id + "_state",
          def: a.state,
          type: "boolean",
          read: true,
          write: true,
          role: "switch",
          desc: "Actor current switch status"
        },
        () => {
          this.log.debug(
            "createStateCallBack for a.id=" + a.id + " for state=" + a.state
          );
          this.setStateAsync(
            adapterPrefix + ".actors.actor_" + a.id + "_state",
            {
              val: a.state,
              ack: true
            }
          );
        }
      );
    }

    for (var siter of allnet.sensors) {
      let s = siter; // make copy against function capturing "closure" issue in for loops
      if (s.id == null || s.id.length == 0) continue;

      await this.createState(
        "",
        "sensors",
        "sensor_" + s.id + "_id",
        {
          name: "sensor_" + s.id + "_id",
          def: s.id ? s.id : "",
          type: "string",
          read: true,
          write: false,
          role: "value",
          desc: "Sensor id"
        },
        () => {
          if (s.id) {
            this.setStateAsync(
              adapterPrefix + ".sensors.sensor_" + s.id + "_id",
              {
                val: s.id,
                ack: true
              }
            );
          }
        }
      );

      await this.createState(
        "",
        "sensors",
        "sensor_" + s.id + "_name",
        {
          name: "sensor_" + s.id + "_name",
          def: s.name ? s.name : "",
          type: "string",
          read: true,
          write: false,
          role: "value",
          desc: "Sensor name"
        },
        () => {
          if (s.name) {
            this.setStateAsync(
              adapterPrefix + ".sensors.sensor_" + s.id + "_name",
              {
                val: s.name,
                ack: true
              }
            );
          }
        }
      );

      await this.createState(
        "",
        "sensors",
        "sensor_" + s.id + "_value",        
        {
          name: "sensor_" + s.id + "_value",
          def: Number(s.current),
          type: "number",
          read: true,
          write: false,
          role: "value",
          desc: "Sensor Current Value"
        },
        () => {
          this.setStateAsync(
            adapterPrefix + ".sensors.sensor_" + s.id + "_value",
            {
              val: Number(s.current),
              ack: true
            }
          );
        }
      );

      await this.createState(
        "",
        "sensors",
        "sensor_" + s.id + "_unit",        
        {
          name: "sensor_" + s.id + "_unit",
          def: s.unit,
          type: "string",
          read: true,
          write: false,
          role: "value",
          desc: "Sensor Unit of Value"
        },
        () => {
          this.setStateAsync(
            adapterPrefix + ".sensors.sensor_" + s.id + "_unit",
            {
              val: s.unit,
              ack: true
            }
          );
        }
      );
    }

    var athis = this; // capture
    allnet.onActorUpdated = (obj: any) => {
      if (this._inOnTimerTick > 0) return; // refresh will follow up in onTimerTick code itself
      athis.refreshAllAdapterStatesFromCurrentAllNetObject();
    };
    allnet.onSensorUpdated = (obj: any) => {
      if (this._inOnTimerTick > 0) return; // refresh will follow up in onTimerTick code itself
      athis.refreshAllAdapterStatesFromCurrentAllNetObject();
    };
    return;
  }

  private async refreshAllAdapterStatesFromCurrentAllNetObject() {
    var allnet = this._allnet;
    if (allnet == null || allnet.actors == null || allnet.actors.length == 0)
      return;

    let adapterPrefix = this.name + "." + this.instance;
    this.log.debug(
      "refreshAllAdapterStatesFromCurrentAllNetObject for ALLNETadapter=" +
        adapterPrefix
    );

    if (allnet != null && allnet.device_date != null) {
      this.setStateAsync(adapterPrefix + ".device_date", {
        val: allnet.device_date,
        ack: true
      });
    }

    if (allnet != null && allnet.device_uptime != null) {
      this.setStateAsync(adapterPrefix + ".device_uptime", {
        val: allnet.device_uptime,
        ack: true
      });
    }

    for (var aiter of allnet.actors) {
      let a = aiter; // make copy against function capturing "closure" issue in for loops
      if (a.id == null || a.id.length == 0) continue;

      this.setStateAsync(adapterPrefix + ".actors.actor_" + a.id + "_state", {
        val: a.state,
        ack: true
      });
    }

    for (var siter of allnet.sensors) {
      let s = siter; // make copy against function capturing "closure" issue in for loops
      if (s.id == null || s.id.length == 0) continue;

      this.setStateAsync(adapterPrefix + ".sensors.sensor_" + s.id + "_value", {
        val: Number(s.current),
        ack: true
      });
    }
  }

  private _inOnTimerTick: number = 0;
  private async onTimerTick() {
    if (this._allnet == null) return;
    var now = Date.now();

    if (this._inOnTimerTick > 0) {
      this.log.debug("onTimerTick reentrant ignored  now=" + now);
      return;
    } else {
      this.log.debug("onTimerTick started...  now=" + now);
    }
    this._inOnTimerTick++;
    try {
      await this._allnet.triggerUpdateAllStates();

      if (this._allnet.actors.length <= 0) {
        await this.createAllAdapterStatesFromCurrentAllNetObject();
      } else {
        await this.refreshAllAdapterStatesFromCurrentAllNetObject();
      }
      await this.initTimer();
    } finally {
      this.log.debug("onTimerTick finished.  now=" + now);
      this._inOnTimerTick--;
    }
  }

  private _timer: NodeJS.Timeout | null = null;
  private _allnet: ALLNETipsocketoutlet4176 | null = null;

  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  private onUnload(callback: () => void): void {
    try {
      this.destroyTimer();
      this.log.debug("cleaned everything up...");
      callback();
    } catch (e) {
      callback();
    }
  }

  /**
   * Is called if a subscribed object changes
   */
  private onObjectChange(
    id: string,
    obj: ioBroker.Object | null | undefined
  ): void {
    if (obj) {
      // The object was changed
      this.log.debug(`object ${id} changed: ${JSON.stringify(obj)}`);
    } else {
      // The object was deleted
      this.log.debug(`object ${id} deleted`);
    }
  }

  private _triggerForceRefreshRunning = 0;

  /**
   * Is called if a subscribed state changes
   */
  private onStateChange(
    id: string,
    state: ioBroker.State | null | undefined
  ): void {
    let allnet = this._allnet;
    if (allnet == null || allnet.actors == null || allnet.actors.length == 0)
      return;

    if (state) {
      // The state was changed
      this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      let adapterPrefix = this.name + "." + this.instance;

      if (id != null && id == adapterPrefix + ".triggerForceRefresh") {
        if (!state.ack && state.val) {
          this.log.debug(
            "triggerUpdateAllStates triggered by triggerForceRefresh state change..."
          );
          this._triggerForceRefreshRunning++;
          if (this._triggerForceRefreshRunning == 1)
            setTimeout(async () => {
              if (allnet == null) return;
              if (this._inOnTimerTick <= 0) {
                this._inOnTimerTick++;

                try {
                  let hadTimer = this._timer != null;

                  if (hadTimer) this.destroyTimer();
                  this.log.debug(
                    "triggerUpdateAllStates triggered by triggerForceRefresh state change now awaiting..."
                  );
                  await allnet.triggerUpdateAllStates();
                  await this.refreshAllAdapterStatesFromCurrentAllNetObject();

                  if (hadTimer) {
                    this.initTimer(); // restart timer to avoid immediate updata gain
                  }
                  this.log.debug(
                    "triggerUpdateAllStates triggered by triggerForceRefresh state change awaiting done..."
                  );
                  this.setState(adapterPrefix + ".triggerForceRefresh", {
                    val: false,
                    ack: true
                  });
                } finally {
                  this._inOnTimerTick--;
                  this._triggerForceRefreshRunning = 0;
                }
              } else {
                this.log.debug(
                  "triggerUpdateAllStates ignored due to timer update running ..."
                );
                this.setState(adapterPrefix + ".triggerForceRefresh", {
                  val: false,
                  ack: true
                });
              }
              this._triggerForceRefreshRunning = 0;
            }, 500 /*rather soon */);
        }
        return;
      }

      let stateprefix = ".actors.actor_";
      let statepostfix = "_state";
      if (
        id != null &&
        id.endsWith(statepostfix) &&
        !state.ack &&
        state.val != undefined
      ) {
        let k = id.indexOf(stateprefix);
        if (k >= 0) {
          let actorID = id.substr(
            k + stateprefix.length,
            id.length - k - statepostfix.length - stateprefix.length
          );

          let newVal: boolean;

          if (
            state.val === "0" ||
            state.val === 0 ||
            state.val === false ||
            state.val === "false"
          )
            newVal = false;
          else if (
            state.val === "1" ||
            state.val === 1 ||
            state.val === true ||
            state.val === "true"
          )
            newVal = true;
          else {
            this.log.error(
              "Discarding invalid state value for ActorID=" +
                actorID +
                " to change state to " +
                state.val
            );
            return;
          }

          var a = allnet.actors.find(x => x.id == actorID);
          if (a != null) {
            this.log.debug(
              "Sending State Change for ActorID=" +
                actorID +
                " to change state to " +
                newVal +
                " ..."
            );
            allnet.triggerSetActorState(actorID, newVal);
          } else {
            this.log.error(
              "Discarding unknown State Change for ActorID=" +
                actorID +
                " to change state to " +
                newVal
            );
          }
        }
      }
    } else {
      // The state was deleted
      this.log.debug(`state ${id} deleted`);
    }
  }

  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.message" property to be set to true in io-package.json
  //  */
  // private onMessage(obj: ioBroker.Message): void {
  // 	if (typeof obj === "object" && obj.message) {
  // 		if (obj.command === "send") {
  // 			// e.g. send email or pushover or whatever
  // 			this.log.info("send command");

  // 			// Send response in callback if required
  // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
  // 		}
  // 	}
  // }
}

if (module.parent) {
  // Export the constructor in compact mode
  module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) =>
    new Allnetipsocketoutlet4176(options);
} else {
  // otherwise start the instance directly
  (() => new Allnetipsocketoutlet4176())();
}
