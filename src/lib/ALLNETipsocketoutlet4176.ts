/*
MIT License

Copyright (c) 2019 mghomedev <mghomedev@gmx.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { encode } from "punycode";

const fetch = require("node-fetch");
const Headers = require("fetch-headers");
const convertXMLJS = require("xml-js");

export function requestXMLGetFromSimpleHTTP(
  url: string,
  username: string | undefined,
  password: string | undefined
) {
  let headers = new Headers();

  headers.append("Content-Type", "text/xml");
  let authURL = url;
  if (username != null && password != null) {
    //let headerAuthString = 'Basic ' + encode(username + ":" + password);
    //headers.append('Authorization', headerAuthString);
    authURL =
      url.substr(0, 7) + username + ":" + password + "@" + url.substr(7);
  }

  return fetch(authURL, {
    method: "get",
    headers: headers
  })
    .then((response: any) => response.text())
    .then((str: string) => {
      if (str == null || str == "") return "EmptyTextResult";
      if (str.indexOf("401 - Unauthorized") >= 0) throw "LoginError";
      if (str.trim().startsWith("<error>"))
        throw "DeviceReturnedErrorAsXML(" + str + ")";
      return str;
    })
    .catch((err: any) => {
      // catch
      //  console.log('requestXMLGetFromSimpleHTTP failed', err);
      return Promise.reject(err);
    });
}

export class ALLNETipsocketoutlet4176Actor {
  public id: string | undefined = undefined;
  public name: string | undefined = undefined;
  public state: boolean | undefined = undefined;
}

export class ALLNETipsocketoutlet4176Sensor {
  public id: string | undefined = undefined;
  public name: string | undefined = undefined;
  public current: number | undefined = undefined;
  public unit: string | undefined = undefined;
}

/**
 * Adapter class to read and write to ALLNET xml API
 * typically located on http://192.168.0.100/xml/
 * compatible with ALLNET ALL4176 IP-Socket 6 actors and many additonal sensors like power sensor see https://www.allnet.de/de/allnet-brand/produkte/neuheiten/p/allnet-all4176-ip-steckdosenleiste-6-fach-schaltbar-per-netzwerk/
 * also compatible with ALLNET  ALL3419 Thermoter and all connectable sensors see https://www.allnet.de/nc/de/allnet-brand/support/treiber-firmware/download/134571/
 */
export class ALLNETipsocketoutlet4176 {
  public ALLNETURL: string | undefined = undefined;
  public ALLNETUSER: string | undefined = undefined;
  public ALLNETPASSWORD: string | undefined = undefined;

  public debugOutputXML: boolean = false;

  public hardware_model: string | undefined = undefined;
  public hardware_revision: string | undefined = undefined;
  public hardware_mac: string | undefined = undefined;
  public firmware: string | undefined = undefined;

  public device_name: string | undefined = undefined;
  public device_date: string | undefined = undefined;
  public device_uptime: string | undefined = undefined;

  public debug = function(info: string) {
    console.log("ALLNETIPSocketoutlet4176DebugInfo:" + info);
  };

  public error = function(info: string) {
    console.log("ALLNETIPSocketoutlet4176Error:" + info);
  };

  public onActorUpdated = function(obj: any) {};

  public onSensorUpdated = function(obj: any) {};

  constructor(ALLNETURL: string, ALLNETUSER: string, ALLNETPASSWORD: string) {
    this.ALLNETURL = ALLNETURL;
    this.ALLNETUSER = ALLNETUSER;
    this.ALLNETPASSWORD = ALLNETPASSWORD;
  }
  doXMLRequest(mode: string, type: string, id: string, action: string) {
    let url = this.ALLNETURL;
    if (url == null || url.length < 10 || !url.startsWith("http://"))
      throw "Invalid ALLNETURL:" + url;

    if (url.indexOf("?") < 0) url += "?";
    if (mode != null && mode.length > 0) {
      url += "&mode=" + mode;
    }
    if (type != null && type.length > 0) {
      url += "&type=" + type;
    }
    if (id != null && id.length > 0) {
      url += "&id=" + id;
    }
    if (action != null && action.length > 0) {
      url += "&action=" + action;
    }
    return requestXMLGetFromSimpleHTTP(
      url,
      this.ALLNETUSER,
      this.ALLNETPASSWORD
    )
      .then((str: string) => {
        var ajson = null;
        try {
          if (str == null || str.length <= 5) return "EmptyXML";

          let json = convertXMLJS.xml2json(str, { compact: true, spaces: 4 });
          if (this.debugOutputXML) this.debug("ALLNET.requestXMLGet:" + json);

          ajson = JSON.parse(json);
          if (ajson == null) throw "EmptyJSONObject after JSON.parse";
        } catch (e) {
          return Promise.reject(
            "XMLParsingError of str=" + str + ". Error=" + e
          );
        }

        if (ajson == null) {
          throw "EmptyJSONObject";
        }
        if (ajson.error != null) {
          throw "ErrorJSONObject:" + str;
        }
        return ajson;
      })
      .catch((err: any) => {
        // catch
        this.error("doXMLRequest failed:" + err);
        return Promise.reject("doXMLRequest error:" + err);
      });
  }

  private _actors: ALLNETipsocketoutlet4176Actor[] = [];

  public get actors(): ALLNETipsocketoutlet4176Actor[] {
    return this._actors;
  }

  private fillActorFromJSON(ma: ALLNETipsocketoutlet4176Actor, ja: any) {
    ma.id = ja.id._text;
    ma.name = ja.name._text;
    if (ja.state._text == "1") ma.state = true;
    else if (ja.state._text == "0") ma.state = false;
    else ma.state = undefined;
  }

  triggerUpdateActionStates() {
    this.debug("triggerUpdateActionStates...");

    return this.doXMLRequest("actor", "list", "", "")
      .then((jsonobj: any) => {
        if (
          jsonobj.actors == null ||
          jsonobj.actors.actor == null ||
          jsonobj.actors.actor.length == 0
        ) {
          this.debug("triggerUpdateActionStates no result");

          this._actors = [];
          return this._actors;
        }
        let n = jsonobj.actors.actor.length;
        if (this._actors.length != n) {
          this._actors = new Array<ALLNETipsocketoutlet4176Actor>(n);
        }

        this.debug("triggerUpdateActionStates loading for ActorCount=" + n);

        for (let i = 0; i < n; i++) {
          var ja = jsonobj.actors.actor[i];
          var ma = this._actors[i];
          if (ma == null) {
            ma = new ALLNETipsocketoutlet4176Actor();
            this._actors[i] = ma;
          }
          this.fillActorFromJSON(ma, ja);
        }

        this.debug("triggerUpdateActionStates done for ActorCount=" + n);

        for (let i = 0; i < n; i++) {
          this.onActorUpdated(this.actors[i]);
        }

        return this._actors;
      })
      .catch((err: any) => {
        // catch
        this.error("triggerUpdateActionStates failed:" + err);
        return Promise.reject("triggerUpdateActionStates error:" + err);
      });
  }

  private _sensors: ALLNETipsocketoutlet4176Sensor[] = [];

  public get sensors(): ALLNETipsocketoutlet4176Sensor[] {
    return this._sensors;
  }

  private fillSensorFromJSON(ma: ALLNETipsocketoutlet4176Sensor, ja: any) {
    ma.id = ja.id._text;
    ma.name = ja.name._text;
    ma.current = ja.current._text;
    ma.unit = ja.unit._text;
  }

  triggerUpdateSensorStates() {
    this.debug("triggerUpdateSensorStates...");

    return this.doXMLRequest("sensor", "list", "", "")
      .then((jsonobj: any) => {
        if (
          jsonobj.sensors == null ||
          jsonobj.sensors.sensor == null ||
          jsonobj.sensors.sensor.length == 0
        ) {
          this._sensors = [];
          this.debug("triggerUpdateSensorStates no result");

          return this._sensors;
        }
        let n = jsonobj.sensors.sensor.length;
        if (this._sensors.length != n) {
          this._sensors = new Array<ALLNETipsocketoutlet4176Sensor>(n);
        }

        this.debug("triggerUpdateSensorStates loading for SensorCount=" + n);

        for (let i = 0; i < n; i++) {
          var ja = jsonobj.sensors.sensor[i];
          var ma = this._sensors[i];
          if (ma == null) {
            ma = new ALLNETipsocketoutlet4176Sensor();
            this._sensors[i] = ma;
          }
          this.fillSensorFromJSON(ma, ja);
        }
        this.debug("triggerUpdateSensorStates done for SensorCount=" + n);

        for (let i = 0; i < n; i++) {
          this.onSensorUpdated(this._sensors[i]);
        }
        return this._sensors;
      })
      .catch((err: any) => {
        // catch
        this.error("triggerUpdateSensorStates failed:" + err);
        return Promise.reject("triggerUpdateSensorStates error:" + err);
      });
  }

  triggerUpdateHardwareInfo() {
    this.debug("triggerUpdateHardwareInfo...");

    return this.doXMLRequest("info", "", "", "")
      .then((jsonobj: any) => {
        if (
          jsonobj == null ||
          jsonobj.system == null ||
          jsonobj.system.hardware == null
        ) {
          this.error("triggerUpdateHardwareInfo got no result");
          throw "ErrorUpdateHardwareInfo";
        }

        this.debug("triggerUpdateHardwareInfo loading result ...");

        this.hardware_model = jsonobj.system.hardware.model._text;
        this.hardware_revision = jsonobj.system.hardware.revision._text;
        this.hardware_mac = jsonobj.system.hardware.mac._text;
        this.firmware = jsonobj.system.firmware._text;
        this.device_name = jsonobj.system.device.name._text;
        this.device_date = jsonobj.system.device.date._text;
        this.device_uptime = jsonobj.system.device.uptime._text;

        this.debug(
          "triggerUpdateHardwareInfo loading result done for device_name=" +
            this.device_name
        );

        return this;
      })
      .catch((err: any) => {
        // catch
        this.error("triggerUpdateHardwareInfo failed:" + err);
        return Promise.reject("triggerUpdateHardwareInfo error:" + err);
      });
  }

  triggerUpdateAllStates() {
    return this.triggerUpdateHardwareInfo()
      .then((obj: any) => this.triggerUpdateSensorStates())
      .then((obj: any) => this.triggerUpdateActionStates())
      .then((obj: any) => {
        return obj != null;
      })
      .catch((err: any) => {
        // catch
        this.error("triggerUpdateAllStates failed:" + err);
        return Promise.reject("triggerUpdateAllStates failed:" + err);
      });
  }

  triggerSetActorState(id: string, onOff: boolean) {
    this.debug("triggerSetActorState(id=" + id + ", onOff=" + onOff + ")...");

    return this.doXMLRequest("actor", "switch", id, onOff ? "1" : "0")
      .then((ajson: any) => {
        this.debug(
          "triggerSetActorState(id=" +
            id +
            ", onOff=" +
            onOff +
            ") parsing result ..."
        );

        if (ajson == null || ajson.actor == null) {
          throw "NoResult";
        }

        if (
          ajson == null ||
          ajson.actor.id == null ||
          ajson.actor.id._text != id
        ) {
          throw "ActorIDMismatchInResult";
        }

        if (
          ajson.actor.result == null ||
          ajson.actor.result._text != (onOff ? "1" : "0")
        ) {
          throw "DesiredResultNotAccomplished";
        }

        for (var a of this._actors) {
          if (a.id == id) {
            a.state = onOff;
            this.onActorUpdated(a);
          }
        }

        this.debug(
          "triggerSetActorState(id=" + id + ", onOff=" + onOff + ") done."
        );
        return true;
      })
      .catch((err: any) => {
        // catch
        this.error(
          "triggerSetActorState(id=" +
            id +
            ", onOff=" +
            onOff +
            ") failed:" +
            err
        );
        return Promise.reject(
          "triggerSetActorState(id=" +
            id +
            ", onOff=" +
            onOff +
            ") failed:" +
            err
        );
      });
  }
}

export function ALLNETIPrequestXMLTest(invertSwitches: boolean) {
  let ALLNETURL = "http://192.168.1.111:80/xml/";
  let ALLNETUSER = "user";
  let ALLNETPASSWORD = "password";

  let allNet = new ALLNETipsocketoutlet4176(
    ALLNETURL,
    ALLNETUSER,
    ALLNETPASSWORD
  );
  //allNet.doXMLRequest("actor", "list", "", "");
  return allNet
    .triggerUpdateAllStates()
    .then((obj: any) => {
      if (allNet.device_name == null) throw "allNet.device_name missing";
      console.log(
        "ALLNETIPrequestXMLTest finished on ALLNET-DeviceName=" +
          allNet.device_name
      );

      for (var a of allNet.actors) {
        console.log(
          "AllNetActor found: id=" +
            a.id +
            " name=" +
            a.name +
            " state=" +
            a.state
        );
      }

      for (var s of allNet.sensors) {
        console.log(
          "AllNetSensor found: id=" +
            s.id +
            " name=" +
            s.name +
            " unit=" +
            s.unit +
            " current=" +
            s.current
        );
      }
      return true;
    })
    .then((obj: any) => {
      if (invertSwitches) {
        for (var a of allNet.actors) {
          if (a.id != null) {
            let switchTo = !a.state;
            allNet
              .triggerSetActorState(a.id, switchTo)
              .then((obj2: any) => {
                console.log(
                  "ALLNETIPrequestXMLTest successfully switched actor for id= " +
                    a.id +
                    " from " +
                    a.state +
                    " to " +
                    switchTo
                );
              })
              .catch((err: any) => {
                console.log(
                  "ALLNETIPrequestXMLTest failed to switched actor for id= " +
                    a.id +
                    " from " +
                    a.state +
                    " to " +
                    switchTo,
                  err
                );
              });
          }
        }
      }
    })
    .catch((err: any) => {
      // catch
      console.log("ALLNETIPrequestXMLTest failed", err);
      return false;
    });
}

//ALLNETIPrequestXMLTest(true);
