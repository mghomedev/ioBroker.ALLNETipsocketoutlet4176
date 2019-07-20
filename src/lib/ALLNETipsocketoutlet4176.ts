

import { encode } from "punycode";

const fetch = require("node-fetch");
const Headers = require('fetch-headers')
const convertXMLJS = require('xml-js');



export function requestXMLGetFromSimpleHTTP(url: string, username: string | undefined, password: string| undefined) {
  let headers = new Headers();

  headers.append('Content-Type', 'text/xml');
  let authURL = url;
  if (username!=null && password!=null) {
     //let headerAuthString = 'Basic ' + encode(username + ":" + password);  
     //headers.append('Authorization', headerAuthString);
    authURL = url.substr(0, 7) + username + ":" + password + "@" + url.substr(7); 
  }

  return fetch(authURL, {
    method: 'get',
    headers: headers
  })
    .then((response: any) => response.text())
    .then((str: string) => {
      if (str == null || str == "") throw "EmptyTextResult";
      if (str.indexOf("401 - Unauthorized") >= 0) throw "LoginError";
      if (str.trim().startsWith("<error>")) throw ("DeviceReturnedErrorAsXML(" + str + ")");
      try {
        let json = convertXMLJS.xml2json(str, { compact: true, spaces: 4 });
        console.log("ALLNET.requestXMLGet:" + json);

        return JSON.parse(json);
      } catch (e) {
        throw "XMLParsingError of str=" + str;
      }
    })
    .then((json: any) => {
      return json;
    }).catch(function (error: any) {                        // catch
      console.log('ALLNETRequest failed', error);
      throw error;
    });
}

class ALLNETipsocketoutlet4176Actor {
  public id: string | undefined = undefined;
  public name: string | undefined = undefined;
  public state: boolean | undefined = undefined;
};

class ALLNETipsocketoutlet4176Sensor {
  public id: string | undefined = undefined;
  public name: string | undefined = undefined;
  public current: number | undefined = undefined;
  public unit: string | undefined = undefined;

};

class ALLNETipsocketoutlet4176 {

  public ALLNETURL: string | undefined = undefined;
  public ALLNETUSER: string | undefined = undefined;
  public ALLNETPASSWORD: string | undefined = undefined;

  public hardware_model: string | undefined = undefined;
  public hardware_revision: string | undefined = undefined;
  public hardware_mac: string | undefined = undefined;
  public firmware: string | undefined = undefined;

  public device_name: string | undefined = undefined;
  public device_date: string | undefined = undefined;
  public device_uptime: string | undefined = undefined;


  constructor(ALLNETURL: string, ALLNETUSER: string, ALLNETPASSWORD: string) {
    this.ALLNETURL = ALLNETURL;
    this.ALLNETUSER = ALLNETUSER;
    this.ALLNETPASSWORD = ALLNETPASSWORD;
  }
  doXMLRequest(mode: string, type: string, id: string, action: string) {
    let url = this.ALLNETURL;
    if (url == null || url.length < 10 || !url.startsWith("http://")) throw "Invalid ALLNETURL:" + url;

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
      action += "&action=" + action;
    }
    return requestXMLGetFromSimpleHTTP(url, this.ALLNETUSER, this.ALLNETPASSWORD);
  }

  private _actors: ALLNETipsocketoutlet4176Actor[] = [];

  public get actors() {
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
    return this.doXMLRequest("actor", "list", "", "").then((jsonobj: any) => {
      if (jsonobj.actors == null) {
        this._actors = [];
        return this._actors;
      }
      let n = jsonobj.actors.actor.length;
      if (this._actors.length != n) {
        this._actors = new Array(n);
      }

      for (let i = 0; i < n; i++) {
        var ja = jsonobj.actors.actor[i];
        var ma = this._actors[i];
        if (ma == null) {
          ma = new ALLNETipsocketoutlet4176Actor();
          this._actors[i] = ma;
        }
        this.fillActorFromJSON(ma, ja);
      }
      return this._actors;
    });

  }

  private _sensors: ALLNETipsocketoutlet4176Sensor[] = [];

  public get sensors() {
    return this._sensors;
  }

  private fillSensorFromJSON(ma: ALLNETipsocketoutlet4176Sensor, ja: any) {

    ma.id = ja.id._text;
    ma.name = ja.name._text;
    ma.current = ja.current._text;
    ma.unit = ja.unit._text;

  }

  triggerUpdateSensorStates() {
    return this.doXMLRequest("sensor", "list", "", "").then((jsonobj: any) => {
      if (jsonobj.sensors == null) {
        this._sensors = [];
        return this._sensors;
      }
      let n = jsonobj.sensors.sensor.length;
      if (this._sensors.length != n) {
        this._sensors = new Array(n);
      }

      for (let i = 0; i < n; i++) {
        var ja = jsonobj.sensors.sensor[i];
        var ma = this._sensors[i];
        if (ma == null) {
          ma = new ALLNETipsocketoutlet4176Sensor();
          this._sensors[i] = ma;
        }
        this.fillSensorFromJSON(ma, ja);
      }
      return this._actors;
    });
  }


  triggerUpdateHardwareInfo() {
    return this.doXMLRequest("info", "", "", "").then((jsonobj: any) => {

      if (jsonobj == null || jsonobj.system == null || jsonobj.system.hardware == null) throw "ErrorUpdateHardwareInfo";

      this.hardware_model = jsonobj.system.hardware.model._text;
      this.hardware_revision = jsonobj.system.hardware.revision._text;
      this.hardware_mac = jsonobj.system.hardware.mac._text;
      this.firmware = jsonobj.system.firmware._text;
      this.device_name = jsonobj.system.device.name._text;
      this.device_date = jsonobj.system.device.date._text;
      this.device_uptime = jsonobj.system.device.uptime._text;

      return this;

    });
  }

  triggerUpdateAllStates() {

    return this.triggerUpdateHardwareInfo()
      .then(this.triggerUpdateSensorStates())
      .then(this.triggerUpdateActionStates())
      .then((obj: any) => { return obj != null })
      .catch(function (error: any) {                        // catch
        console.log('triggerUpdateAllStates failed', error);
        return false;
      });

  }
}


