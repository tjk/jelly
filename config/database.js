var mongodb     = require("../lib/mongodb"),
    mongoserver = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, {}),
    mongoconn   = new mongodb.Db('blog', mongoserver, {});
