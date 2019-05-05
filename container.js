/*Aici se vor inregistra toate modulele utilizate, pentru a nu mai fi nevoie sa fie apelata functia require in fiecare fisier*/
const dependable = require('dependable');
const path = require('path');//input module, don't need to be installed
const container = dependable.container();

//express si cele care se folosesc o data nu are rost sa fie adaugate aici
const myModules = [
  ['_','lodash'],//aici vin si restul modulelor, separate cu virgula
  ['mongoose', 'mongoose'],
  ['passport', 'passport'],
  ['formidable','formidable'],
  ['async', 'async'],
  ['Club', './models/clubs'],
  ['Users', './models/user'],
  ['aws', './helpers/AWSUpload']


];

myModules.forEach(function(val){
  container.register(val[0], function(){
    return require(val[1]);
  })
});

container.load(path.join(__dirname, '/controllers'));//in controllers o sa
container.load(path.join(__dirname, '/helpers'));

//trebuie exportat inclusiv si container
container.register('container', function(){
  return container;
});

module.exports = container;//pentru a putea fi utilizat si in altele
