const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const exhbs = require('express-handlebars');
const dbo = require('./db');
const ObjectID = dbo.ObjectID;

app.engine('hbs',exhbs.engine({layoutsDir:'views/',defaultLayout:"main",extname:"hbs"}))
app.set('view engine','hbs');
app.set('views','views');
app.use(bodyparser.urlencoded({extended:true}));

app.get('/',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('details');
    const cursor = collection.find({})
    let details = await cursor.toArray();

    let message = '';
    let edit_id, edit_detail;

    if(req.query.edit_id){
        edit_id = req.query.edit_id;
        edit_detail = await collection.findOne({_id:new ObjectID(edit_id)})
    }

    if (req.query.delete_id) {
        await collection.deleteOne({_id:new ObjectID(req.query.delete_id)})
        return res.redirect('/?status=3');
    }
    
    switch (req.query.status) {
        case '1':
            message = 'Inserted Succesfully!';
            break;

        case '2':
            message = 'Updated Succesfully!';
            break;

        case '3':
            message = 'Deleted Succesfully!';
            break;
    
        default:
            break;
    }


    res.render('main',{message,details,edit_id,edit_detail})
})

app.post('/store_detail',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('details');
    let detail = { name: req.body.name, email: req.body.email, phone: req.body.phone, age: req.body.age, password: req.body.password };
    await collection.insertOne(detail);
    return res.redirect('/?status=1');
})

app.post('/update_detail/:edit_id',async (req,res)=>{
    let database = await dbo.getDatabase();
    const collection = database.collection('details');
    let detail = { name: req.body.name, email: req.body.email, phone: req.body.phone, age: req.body.age, password: req.body.password };
    let edit_id = req.params.edit_id;

    await collection.updateOne({_id:new ObjectID(edit_id)},{$set:detail});
    return res.redirect('/?status=2');
})

app.listen(8006,()=>{console.log('Listening to the port');})
