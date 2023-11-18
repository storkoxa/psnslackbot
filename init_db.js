import { Database } from 'sqlite-async';

const DB_FILE_NAME = "./psnslackbot.db"
 
Database.open(DB_FILE_NAME, Database.OPEN_READWRITE).then(db => {
  console.log("DB ALREADY EXISTS.")
}).catch(err => {
   if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();      
   } else if (err) {
      console.log("Getting error " + err);
      exit(1);
    }   
})




function createDatabase() {
    Database.open(DB_FILE_NAME).then((db) => { 
      createTables(db)
    }).catch((err) => {      
        console.log("Getting error " + err);
        exit(1);      
    });
}





function runQueries(db) {

  db.exec(`
    INSERT INTO users values ('3297186653700071198', 'Danilo', 'U0GTETFSP', ${Date.now()});
    INSERT INTO users values ('7660671830798233026', 'Derik', 'U0GSX62TE', ${Date.now()});
    INSERT INTO users values ('560281271391506782', 'Enrique', 'U065LJMET9P', ${Date.now()});
    INSERT INTO users values ('1156334989337888583', 'Raphael', 'U0GT38QPM', ${Date.now()});
    INSERT INTO users values ('1525204063776681372', 'Zinho', 'U0GTNCVAP', ${Date.now()});
    INSERT INTO users values ('1568488172154044809', 'Sagui', 'U0H1W8QQH', ${Date.now()});
    INSERT INTO users values ('6772471534155776035', 'Luan', 'U0H21GLTX', ${Date.now()});

    /*INSERT INTO games values ('game1', 'Game 1', 'icon_1', 'trophy');
    
    INSERT INTO games values ('game2','Game 2', 'icon_2', 'trophy');
    INSERT INTO games values ('dbz', 'Dbz_1', 'icon_3', 'trophy2');
    
    INSERT INTO user_games values ('me', 'game1', 0, ${Date.now() - 10000000});
    INSERT INTO user_games values ('me', 'dbz', 0, ${Date.now()});


    INSERT INTO trophies values ('1', 'game1', 'trophy_type1', 'trophy_name1', 'trophy_detail1', 'trophy_icon1');
    INSERT INTO trophies values ('2', 'game1', 'trophy_type2', 'trophy_name2', 'trophy_detail2', 'trophy_icon2');
    INSERT INTO trophies values ('3', 'game1', 'trophy_type3', 'trophy_name3', 'trophy_detail3', 'trophy_icon3');


    INSERT INTO trophies values ('1', 'dbz', 'trophy_type4', 'Kill Freeza', 'kill freeza', 'trophy_icon4');


    INSERT INTO user_trophies values ('1', 'game1' ,'me', ${Date.now()}, 3, '5%');
    INSERT INTO user_trophies values ('2', 'game1' ,'me', ${Date.now()}, 2, '1%');

    INSERT INTO user_trophies values ('1', 'dbz','me', ${Date.now()}, 2, '1%');*/



    `).then(db => {
    console.log("Completed")
  }).catch(err => {
    console.log("Could not insert rows the tables " + err);
            
  })
}

function createTables(newdb) {
    newdb.exec(`
    create table users (
        user_id varchar(32) PRIMARY KEY UNIQUE,
        user_name text not null,
        slack_id varchar(32),
        last_updated int        
    );
    CREATE UNIQUE INDEX index_users_user_id  ON users (user_id);


    create table games (
        game_id varchar(32) PRIMARY KEY UNIQUE,
        game_name text not null,
        game_icon text not null,
        service_name varchar(16)
    );
    
    CREATE UNIQUE INDEX index_games_game_id  ON games (game_id);

    create table user_games (
        user_id varchar(32) not null,
        game_id text not null,

        game_progress int,
        game_last_updated int,


        CONSTRAINT fk_users_games_game FOREIGN KEY (user_id) REFERENCES users(user_id),
        CONSTRAINT fk_users_games_user FOREIGN KEY (game_id) REFERENCES games(game_id)   
    );

    CREATE UNIQUE INDEX index_user_games_user_id ON user_games (user_id, game_id);



    create table trophies (
        trophy_id varchar(32) not null,
        game_id varchar(32) not null,
        trophy_type varchar(32), 
        trophy_name text, 
        trophy_detail text, 
        trophy_icon text,
        
        CONSTRAINT fk_trophies_game_id FOREIGN KEY (game_id) REFERENCES games(game_id)   

    );

    CREATE UNIQUE INDEX index_user_trophies_trophy_id ON trophies (trophy_id, game_id);
    CREATE INDEX index_user_trophies_game_id ON trophies (game_id);


    
    create table user_trophies (
      trophy_id varchar(32) not null,
      game_id varchar(32) not null,
      user_id varchar(32) not null,
      trophy_earned int, 
      trophy_rare int, 
      trophy_earned_rate varchar(8), 

      CONSTRAINT fk_user_trophies_game_id  FOREIGN KEY (game_id) REFERENCES games(game_id),   
      CONSTRAINT fk_user_trophies_trophy_id  FOREIGN KEY (trophy_id) REFERENCES trophies(trophy_id),   
      CONSTRAINT fk_user_trophies_user_id FOREIGN KEY (user_id) REFERENCES users(user_id)   

    );
    CREATE UNIQUE INDEX index_user_trophies_user_id_trophy ON user_trophies (user_id, game_id, trophy_id);

    `)
    .then(db => {  runQueries(db)  })
    .catch(e => {
        console.log("Could not create the tables " + e);
      
    })
}