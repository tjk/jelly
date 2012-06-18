README
======

!!! IMPORTANT = Jelly is far from ready. Check out what's been done so far and try to contribute? :)

Getting started
---------------

### Installing Jelly from source

    cd <where you want the Jelly source>
    git clone GIT_URL

### Using npm

Eventually should be as simple as:

    npm install jelly

Known Issues (to fix)
---------------------

* server crashes on controller generation
* first load of html files crashes http.js write (not buffer or text)
  - CHECK application controller line 23!!
* use supervisor!
* when using certain components, automatically add to node modules folder
* instead of crap ton of command line args, read configuration from
    .jelly file or something (also use that to check if cwd is jelly app)
  - create Component.js superclass, also add modules field (with names +
      versions?)
* so much code cleaning
* efficiency!!!

Upcoming
--------

* Notifications system
* Live updates + web sockets (publish + subscribe)

License
-------

Jelly is licensed under [MIT license](./LICENSE.md).
