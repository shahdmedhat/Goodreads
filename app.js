const 
express = require("express"),
methodOverride = require("method-override"),
fs = require("fs"),
bodyParser = require("body-parser"),
users = require("./users.json"),
books = require("./books.json"),
flash = require("connect-flash"),
app = express();

var loggedUser = null;


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret:"Secter whatev",
    resave: false,
    saveUninitialized: false,
}));
app.use(flash()); 
app.use((req,res,next)=>{
    res.locals.error = req.flash("error");
    // res.locals.success = req.flash("success");
    next();
});

app.set("view engine","ejs");

//======= Login and Register =========

app.get("/",(req,res)=>{
    res.render("login");
});

app.post("/",(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    if(checkUserExists(username,users)==false){
        req.flash("error","User does not exist");
        res.redirect("/");
    }
    else{
        loggedUser = checkUserExists(username,users);
        if(loggedUser.password !== password){
            req.flash("error","Password is incorrect");
            res.redirect("/");
        }
        else{
            res.redirect("/home");
            console.log(loggedUser);
        }
    }

})

app.get("/registration",(req,res)=>{
    res.render("registration");
});

app.post("/registration",(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    let readList = [];
    let user = 
    {
        username: username,
        password: password,
        readList: []
    };
    
    if(checkUserExists(username,users) !== false){
        // res.send("User already exists");
        req.flash("error","User already exists");
        res.redirect("/registration");
    }
    else{
        users["users"].push(user);
        fs.writeFileSync("users.json",JSON.stringify(users));
        res.redirect("/");
    }
   
});

//======= Home Page =======

app.get("/home",isLoggedIn,(req,res)=>{
    res.render("home");
});

//======== Search ========

app.post("/search",isLoggedIn,(req,res)=>{
    console.log(req.body.Search);
    let bookName = req.body.Search;
    let results = getBook(books["books"], bookName);
    res.render("searchresults",{results: results});
})

//========= Read List ==========

app.get("/readlist",isLoggedIn,(req,res)=>{
    res.render("readlist",{loggedUser: loggedUser});
});

app.post("/readlist",(req,res)=>{
    let referer = req.get("referer")
    let name = truncate(referer);
    let link = "/" + name;
    let title = getTitle(books["books"], name);
    console.log(title);
    let book =
    {
        name: name,
        link: link,
        title: title
    }
    let addingResult = addToList(users["users"], loggedUser["username"], book);
    if(addingResult === 0){
        req.flash("error","Book already exists in list");
        console.log("book not added");
    }
    else{
        fs.writeFileSync("users.json",JSON.stringify(users));
    }
    
    
    res.redirect("/readlist");
});


//===== Books requests ======

app.get("/novel",isLoggedIn,(req,res)=>{
    res.render("novel");
});

app.get("/poetry",isLoggedIn,(req,res)=>{
    res.render("poetry");
});

app.get("/fiction",isLoggedIn,(req,res)=>{
    res.render("fiction");
});

app.get("/grapes",isLoggedIn,(req,res)=>{
    res.render("grapes");
});

app.get("/flies",isLoggedIn,(req,res)=>{
    res.render("flies");
});

app.get("/dune",isLoggedIn,(req,res)=>{
    res.render("dune");
});

app.get("/mockingbird",isLoggedIn,(req,res)=>{
    res.render("mockingbird");
});

app.get("/sun",isLoggedIn,(req,res)=>{
    res.render("sun");
});

app.get("/leaves",isLoggedIn,(req,res)=>{
    res.render("leaves");
});


function checkUserExists(username,users){
    for(let i=0;i<users["users"].length;i++){
            if(users["users"][i]["username"].toLowerCase() === username.toLowerCase()){        
                return users["users"][i];
            }
    }
    return false;
    
};

function isLoggedIn(req,res,next){
    
    if(loggedUser !== null){
        return next();
    }
    else{
        req.flash("error", "You must login first");
        res.redirect("/");
        console.log("login first");
    }
}

function truncate (url){
    var res="";
    var start = false;
    for(var i = 0; i < url.length ; i++){
        if(start === true){
            // console.log("adding");
            res+= url[i];
            // console.log(url[i]);
            // console.log(res)
        }
        if(url[i] === "/" && (url[i+1] !== "/" && url[i-1] !== "/" ) && start === false){
            start = true;
        }
        
    }
    return res;
}

function addToList(usersList, loggedUsername, book){
    for(var i=0; i<usersList.length; i++){
        // console.log(loggedUseapp.use(require("express-session")({
    secret:"Secter whatev",
    resave: false,
    saveUninitialized: false,
}));rname);
        // console.log(usersList[i]["username"]);
        if(loggedUsername === usersList[i]["username"]){
            console.log(loggedUsername + "list accessed");
            if(checkBookExists(usersList[i]["readList"], book) === false){
                console.log(book["name"]+" added");
                usersList[i]["readList"].push(book); 
            }
            else{
                console.log("book exists");
                return 0;
            }
                
        }
    }
    console.log("something went wrong");
}app.use(require("express-session")({
    secret:"Secter whatev",
    resave: false,
    saveUninitialized: false,
}));

function getTitle(booksList, name){
    for(var i=0; i<booksList.length; i++){
        if(booksList[i]["name"] === name){
            return booksList[i]["title"];
        }
    }
}

function getBook(booksList, searchWord){
    let results=[];
    for(var i=0; i<booksList.length; i++){
        let title = booksList[i]["title"].toLowerCase();
        searchWord = searchWord.toLowerCase();
        if(title.includes(searchWord)){
            results.push(booksList[i]);
        }
        else{
            if(searchWord.includes(title)){
                results.push(booksList[i]);
            }
        }
    }
    if(results.length !== 0){
        console.log("results: "+results);
        return results;
    }
    return false;
}

function checkBookExists(readlist,book){
    for(var i=0; i<readlist.length ; i++){
        console.log(readlist[i].name + "/" +book.name);
        if(readlist[i].name === book.name){
            return true;
        }
    }
    return false;
}


app.listen(process.env.PORT || 3000, function(){
    console.log(loggedUser);
    console.log(users);
    // if(checkUserExists("mira",users) !== false){
    //     console.log("User already exists");
    // }
});