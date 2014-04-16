var WriteOperation = function (ws, key, value) {
   this.value = value;
   this.key = key;
   this.id = new Date().getTime();

   this.data =  {
      key: this.key,
      value: this.value,
      id: this.id
   };

   this.callbacks = {
      'success': [],
      'fail': []
   };

   ws.on('confirm', function (d) {
      if (d.id !== id) {
         return;
      }

      this.callbacks['success'].forEach(function (cb) {
         cb();
      });
   }.bind(this));
};

WriteOperation.prototype.commit = function () {
   ws.emit('write', this.data);
};

WriteOperation.prototype.success = function (cb) {
   this.callbacks['success'].push(cb);
};

WriteOperation.prototype.fail  = function () {
   this.callbacks['fail'].push(cb);
};

var ReadOperation = function (ws, key) {
   this.callbacks = {
      'success': []
   };

   ws.on('read', function (data) {
      if (data.key === key) {
         this.callbacks.success.forEach(function (cb) {
            cb(data.value);
         });
      }
   });
};

ReadOperation.prototype.success = function (cb) {
   this.callbacks['success'].push(cb);
};

var KeePee = function (ws) {
   this.data = {};
   this.ws = ws;

   ws.on('write', function (d) {
      this.data[d.key] = d;
      ws.emit('confirm', d);
   });

   ws.on('read', function (key) {
      ws.emit('read', this.data[key]);
   });
};

KeePee.prototype.write = function (key, value) {
   var wo = new WriteOperation(this.ws, key, value);

   wo.success(function () {
      this.data[key] = wo.data;
   }.bind(this));

   return wo;
};

KeePee.prototype.read = function (key) {
  var ro = new ReadOperation(this.ws, key);
  return ro;
};


var kp = new KeePee();

var writeOperation = kp.write('Foo', 'Bar');

writeOperation.success(function () {

});

writeOperation.fail(function () {

});

