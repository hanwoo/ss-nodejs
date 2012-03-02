var Chat = module.exports = (function(){
  var io
    , httpClient
    , SSWebOpts
    , that = {
    configure : function(opts){
      if(opts){
        io = opts.io;
        httpClient = opts.httpClient;
        SSWebOpts  = opts.SSWebOpts; 
      }
      return that;
    },
    init : function(opts){
      if(io && httpClient){
        that.loadChat();
      }else{
        console.log('Failed load chat module');
      }
      return that;
    },
    
    loadChat : function(){
      var chat = io
        .of('/chat')
        .on('connection', function (socket) {
          socket.on('chat', function (data) {
            chat.emit('message', data);
          });
          
          socket.on('getIn', function (data) {
            // checkin
            var req = that.httpRequest('/chat/in?sock=' + socket.id + '&email=' + data.email,function(){
              chat.emit('refresh', {msg:'update'});
            });
          });

          socket.on('disconnect', function () {
            // checkout
            var req = that.httpRequest('/chat/out?sock=' + socket.id,function(){
              chat.emit('refresh', {msg:'update'});
            });
          });
        });
      },
      
      httpRequest : function(url, callback){
        var req = httpClient.get(that.getHttpOptions(url),function(res){
              res.on('data', function (chunk) {
                callback();
              });
              res.on('error',function(e){
                console.log('problem with request: ' + e.message);
              });
        });
        req.end();
        return req;
      },
      
      getHttpOptions : function(path){
        var opts = SSWebOpts;
        opts.path = path;
        return opts;
      }
  };
  return that;
})();