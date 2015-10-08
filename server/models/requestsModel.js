var db = require('../db.js');

module.exports = {

	getRequestsByUserId: function (userId) {
    return db('gameposts').select([
        'gameposts.*',
        'requests.*',
        'users.picture as host_pic',
        'users.username as host_name',
        'gameposts.id as gamepost_id',
        db.raw("(SUM(CASE requests.status WHEN 'accepted' THEN 1 ELSE 0 END)+1) as accepted_players")
      ])
      .groupBy('gameposts.id', 'requests.id', 'users.picture', 'users.username')
      .where({user_id: userId})
      .join('requests', 'gameposts.id', 'requests.gamepost_id')
      .join('users', 'gameposts.host_id', 'users.id')
      .then(function (result) {
        if ( result.length ) {
          return result;
        } else {
          return "request does not exist";
        }
      })
      .catch(function (err) {
        console.log(err);
        return err;
      });
  },

  getRequestByGameId: function (gamepostId) {
    return db.select([
      'gameposts.*',
      'requests.*',
      'gameposts.id as gamepost_id',
      'username'
    ])
      .from('requests')
      .where({gamepost_id: gamepostId})
      .join('gameposts', 'gamepost_id', 'gameposts.id')
      .join('users', 'user_id', 'users.id')
      .catch(function (err) {
        console.log(err);
        return err;
      })
  },

  getRequestersPictures: function(gamepostId) {
    return db('requests')
      .join('users', 'user_id', 'users.id')
      .select([
        'user_id',
        'users.username',
        'users.picture'
      ])
      .where({
        gamepost_id: gamepostId,
        status: 'accepted'
      })
      .then(function(results){
        return results;
      })
      .catch(function(err){
        console.log("getRequestersPictures model Error: ", err);
        return err;
      })
  },

  changeStatus: function (request) {
    return db('requests')
      .where({id: request.id})
      .update({
        status: request.status,
        updated_at: db.raw('now()')
      })
      .catch(function (err) {
        console.log(err);
        return err
      })
  },

  create: function (request) {
    return db('requests')
      .select()
      .where({
        user_id: request.user_id,
        gamepost_id: request.gamepost_id
      })

      .then(function (requests) {
        if ( requests.length > 0 ) {
          return "Request has already been submmited once!"
        } else {
          return db('requests')
            .insert(request)
            .returning("id")
            .then(function (requestId) {
              console.log("create request with requestId: ", requestId);
              return module.exports.find(requestId[0]);
            })
            .then(function (request) {
              return request[0];
            });
        }
      })
  },

  deleteRequest: function (requestId) {
    return db.select()
      .from('requests')
      .where({
          id:requestId
      })
      .del()
      .catch(function (err) {
        console.log(err);
        return err;
      })
  },

  find: function (requestId) {
    return db.select()
      .from('requests')
      .where({id: requestId})      
  },

  declineAll: function (gamepostId) {
    return db('requests')
      .where({gamepost_id: gamepostId})
      .update({
        status: 'declined',
        updated_at: db.raw('now()')
      })
      .returning('id')
      .catch(function (err) {
        console.log(err);
        return err;
      })
  },

  acceptedPlayers: function (gamepostId) {
    return db('requests')
      .where({
        gamepost_id: gamepostId,
        status: 'accepted'
      })
      .then(function (data) {
        return data.length;
      })
      .catch(function (err) {
        console.log(err);
        return err;
      })
  },

  fetchById: function (requestId) {
    return db('requests')
      .where('id', requestId)
      .then(function (result) {
        if ( result.length === 0 ) {
          return null
        } else {
          return result[0]
        }
      })
      .catch(function (err) {
        return err;
      });
  }

};
