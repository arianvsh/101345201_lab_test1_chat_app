const app = require('express')();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
const io = socketio(http);
const bodyParser = require('body-parser');
require('dotenv/config');
app.use(bodyParser.urlencoded({extended: false}));

const User = require("./models/user");
const Message = require("./models/message");

app.use(cors());

mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connected to Database!!");
    }).catch(err => {
        console.log(err);
        console.log("Could not connect to the Database!!");
        process.exit();
})


app.get("/" , (req , res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get("/register" , (req , res) => {
    res.sendFile(__dirname + '/register.html');
});

app.get("/chat" , (req , res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.post('/register' , async(req , res) => {
    const newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
    })
    try{
        await newUser.save();
        res.redirect('/');
        
        
    }catch(err){
        console.log(err);
        res.redirect('/register');
    }

});

let users = '';
app.post("/" , async(req , res) => {
    const uName = req.body.username;
    const pWord = req.body.password;
    
    if(uName != "" && pWord != ""){
        User.find({username : uName} , function(err , data){
            users = uName;
            try{
                if(data[0]){
                    if(data[0].password == pWord){
                        res.redirect('/chat');   
                    }
                    else{
                        res.redirect('/')
                    }
                }
                else{
                    res.redirect('/');
                }
            }catch(err) {
                console.log(err);
            }
        });
    };
});

// Socket connection
io.on('connection' , socket => {
    console.log("New Socket connected...");

    
    socket.emit('message' , "Welcome to the chat");

    socket.on('joinRoom' , room => {
        socket.join(room);

        socket.on('chatMessage' , msg => {
            if(room == 'news'){
                socket.to('news').emit('message' , msg);
                const input_message = new Message({
                    from_user : users,
                    room : room,
                    message : msg
                });
                input_message.save().then(() => {
                    console.log('success');
                });
                
            }
            else if(room == 'Covid-19'){
                socket.to('Covid-19').emit('message' , msg);
                const input_message = new Message({
                    from_user : users,
                    room : room,
                    message : msg
                });
                input_message.save().then(() => {
                    console.log('success');
                });
            }
            else if(room == 'NodeJS'){
                socket.to('NodeJS').emit('message' , msg);
                const input_message = new Message({
                    from_user : users,
                    room : room,
                    message : msg
                });
                input_message.save().then(() => {
                    console.log('success');
                });
            }
            
        });
    });
    
    
    socket.on('disconnect' , () => {
        console.log('Socket disconnected...');
    });
});








const PORT = 3000 || process.env.PORT

http.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`)
})