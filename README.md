![Logo](admin/allnetipsocketoutlet4176.png)
# ioBroker.allnetipsocketoutlet4176

[![NPM version](http://img.shields.io/npm/v/iobroker.allnetipsocketoutlet4176.svg)](https://www.npmjs.com/package/iobroker.allnetipsocketoutlet4176)
[![Downloads](https://img.shields.io/npm/dm/iobroker.allnetipsocketoutlet4176.svg)](https://www.npmjs.com/package/iobroker.allnetipsocketoutlet4176)
[![Dependency Status](https://img.shields.io/david/mghomedev/iobroker.allnetipsocketoutlet4176.svg)](https://david-dm.org/mghomedev/iobroker.allnetipsocketoutlet4176)
[![Known Vulnerabilities](https://snyk.io/test/github/mghomedev/ioBroker.allnetipsocketoutlet4176/badge.svg)](https://snyk.io/test/github/mghomedev/ioBroker.allnetipsocketoutlet4176)

[![NPM](https://nodei.co/npm/iobroker.allnetipsocketoutlet4176.png?downloads=true)](https://nodei.co/npm/iobroker.allnetipsocketoutlet4176/)

**Tests:**: [![Travis-CI](http://img.shields.io/travis/mghomedev/ioBroker.allnetipsocketoutlet4176/master.svg)](https://travis-ci.org/mghomedev/ioBroker.allnetipsocketoutlet4176)

## allnetipsocketoutlet4176 adapter for ioBroker

ALLNET IP Socket Outlet 4176 with 6 sockets

## User manual 

This is an ioBroker Home Automation Adapter for the ALLNET ALL4176 IP/WIFI Socket Outlet with 6 sockets

https://www.allnet.de/de/allnet-brand/produkte/neuheiten/p/allnet-all4176-ip-steckdosenleiste-6-fach-schaltbar-per-netzwerk/

This device and the adapter allows to switch all sockets and reports all sensor data e.g. the used power,state of current switches, voltages currents etc. 
It can also report any sensor data of additional connected sensors

( German: Adapter für die IP/WLAN gesteuerte 6-fach Steckdosenleiste von ALLNET ALL4176 )

Additionally, it is also compatible with other ALLNET devices like 
* ALLNET  ALL3419 Thermoter and all connectable sensors see https://www.allnet.de/nc/de/allnet-brand/support/treiber-firmware/download/134571/ even with temperature and hydro sensor attached 
* ALLNET ALL4176 IP/WIFI Socket Outlet with 6 sockets https://www.allnet.de/de/allnet-brand/produkte/neuheiten/p/allnet-all4176-ip-steckdosenleiste-6-fach-schaltbar-per-netzwerk/ even with temperature and hydro sensor attached 
* etc. (probably all ALLNET devices that have the same remote xml format )


To use the adapter, the XML-Interface must be activated for a user in the ALLNET ALL4176 device, which means:
- find out the hostname/ip address of your ALLNET device
- log into it with a web browser
- go to "Configuration"-> "Server and users"
- in "Servers and users"->"User Settings"  add a user/password with rights "View & Switch" and with user type "Remote Control". 
- in "Servers and users"->"Access control" enable "Access Control" and enable "Activate Remote Control" - ("Slave mode" can stay disabled, I do not know what that is)

- Then test if you can access the xml-API-url "http://<hostname>/xml"  with your user/password. 
- On success, it will display the API description with title "XML Help"

- Then, in ioBroker install the adapter, and enter the xml-API-url, the username and password in the adapter settings. 

## Developer manual

The implementation is based on my interface class "ALLNETipsocketoutlet4176" which is available in the lib folder and on github here https://github.com/mghomedev/ioBroker.ALLNETipsocketoutlet4176/blob/master/src/lib/ALLNETipsocketoutlet4176.ts

### Getting started

You are almost done, only a few steps left:
1. Create a new repository on GitHub with the name `ioBroker.allnetipsocketoutlet4176`
1. Initialize the current folder as a new git repository:  
	```bash
	git init
	git add .
	git commit -m "Initial commit"
	```
1. Link your local repository with the one on GitHub:  
	```bash
	git remote add origin https://github.com/mghomedev/ioBroker.allnetipsocketoutlet4176
	```

1. Push all files to the GitHub repo:  
	```bash
	git push origin master
	```
1. Head over to [src/main.ts](src/main.ts) and start programming!

### Scripts in `package.json`
Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description                                              |
|-------------|----------------------------------------------------------|
| `build`    | Re-compile the TypeScript sources.                       |
| `watch`     | Re-compile the TypeScript sources and watch for changes. |
| `test:ts`   | Executes the tests you defined in `*.test.ts` files.     |
| `test:package`    | Ensures your `package.json` and `io-package.json` are valid. |
| `test:unit`       | Tests the adapter startup with unit tests (fast, but might require module mocks to work). |
| `test:integration`| Tests the adapter startup with an actual instance of ioBroker. |
| `test` | Performs a minimal test run on package files and your tests. |
| `coverage` | Generates code coverage using your test files. |

### Writing tests
When done right, testing code is invaluable, because it gives you the 
confidence to change your code while knowing exactly if and when 
something breaks. A good read on the topic of test-driven development 
is https://hackernoon.com/introduction-to-test-driven-development-tdd-61a13bc92d92. 
Although writing tests before the code might seem strange at first, but it has very 
clear upsides.

The template provides you with basic tests for the adapter startup and package files.
It is recommended that you add your own tests into the mix.

### Publishing the adapter
See the documentation of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually on a local ioBroker installation
In order to install the adapter locally without publishing, the following steps are recommended:
1. Create a tarball from your dev directory:  
	```bash
	npm pack
	```
1. Upload the resulting file to your ioBroker host
1. Install it locally (The paths are different on Windows):
	```bash
	cd /opt/iobroker
	npm i /path/to/tarball.tgz
	```

For later updates, the above procedure is not necessary. Just do the following:
1. Overwrite the changed files in the adapter directory (`/opt/iobroker/node_modules/iobroker.allnetipsocketoutlet4176`)
1. Execute `iobroker upload allnetipsocketoutlet4176` on the ioBroker host

## Changelog

### 0.0.2
* (mghomedev) updates external packages and typescript javascript target version to es2017 

### 0.0.1
* (mghomedev) initial release

## License
MIT License

Copyright (c) 2019-2020 mghomedev <mghomedev@gmx.de>

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