 // server/server.js

  let express = require("express");
  let graphqlHTTP = require("express-graphql");
  let { buildSchema } = require("graphql");
  let cors = require("cors");
  let Pusher = require("pusher");
  let bodyParser = require("body-parser");
  let Multipart = require("connect-multiparty");

  // Construct a schema, using GraphQL schema language
  let schema = buildSchema(`
      type User {
        id : String!
        nickname : String!
        avatar : String!
      }
      type Post {
          id: String!
          user: User!
          caption : String!
          image : String!
      }
      type Query{
        user(id: String) : User!
        post(user_id: String, post_id: String) : Post!
        posts(user_id: String) : [Post]
      }
  `);


  // Maps id to User object
  let userslist = {
    a: {
      id: "a",
      nickname: "Brayan Huaman Pereda",
      avatar: "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
    },
    b: {
      id: "b",
      nickname: "BHP",
      avatar:
        "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
    }
  };

  let postslist = {
    a: {
      a: {
        id: "a",
        user: userslist["a"],
        caption: "Paris",
        image: "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
      },
      b: {
        id: "b",
        user: userslist["a"],
        caption: "Paris",
        image:
          "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
      },
      c: {
        id: "c",
        user: userslist["a"],
        caption: "Paris",
        image: "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
      },
      d: {
        id: "d",
        user: userslist["a"],
        caption: "Paris",
        image: "https://scontent.flim5-4.fna.fbcdn.net/v/t31.0-8/28337276_10155394741062333_7368194779110885507_o.jpg?_nc_cat=101&_nc_eui2=AeEAdJHKzqUQKtBhfEI6378kBBiBa-eDMvCXtmD-pJv_PJcVqkR9CjRRIdD27rIzy_OcYFtfPKQ6o-IsxCWKv9Rew7C3gDSf0H99afYDGQPvHQ&_nc_ht=scontent.flim5-4.fna&oh=4cddfc02f187bad63d3937fa4e1ea0db&oe=5C46301B"
      }
    }
  };

   // The root provides a resolver function for each API endpoint
   let root = {
    user: function({ id }) {
      return userslist[id];
    },
    post: function({ user_id , post_id }) {
      return postslist[user_id][post_id];
    },
    posts: function({ user_id }){
      return Object.values(postslist[user_id]);
    }
  };

  // Configure Pusher client
  let pusher = new Pusher({
    appId: 'ID',
    key: 'KEY',
    secret: 'SECRET',
    cluster: 'us2',
    encrypted: true
  });

  let app = express();
  app.use(cors());
  app.use(bodyParser.json());

   //add Middleware
   let multipartMiddleware = new Multipart();

   app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true
    })
  );

   //trigger add a new post
   app.post('/newpost', multipartMiddleware, (req,res) => {
     // create a sample post
     let post = {
       user : {
         nickname : req.body.name,
         avatar : req.body.avatar
       },
       image : req.body.image,
       caption : req.body.caption
     };

     // trigger pusher event
     pusher.trigger("posts-channel", "new-post", {
       post
     });

     return res.json({status : "Post created"});
   });


  // set application port
  app.listen(4000);
  console.log("Running a GraphQL API server at localhost:4000/graphql");
