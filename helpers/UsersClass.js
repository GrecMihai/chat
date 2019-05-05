/*
Clasa folosita pentru a afisa utilizatorii online, ar putea si sa nu fie folosita, si sa declari un array in socket/groupchat.js, si in momentul in care unul se conecteaza sa faci push la informatiile despre el
*/
class Users {
  constructor(){
    this.users = [];
  }

  AddUserData(id, name, room){
    var user = {id, name, room};//object destructuring, pt ca value and key have the same name, adik nu mai tre sa faci tu cum faci in rest peste tot, ceva vrajeala de ES6
    this.users.push(user);
    return user;
  }

  GetUsersList(room){
    //destul de clar ce face filter
    var users = this.users.filter((user) => user.room === room);
    var names = users.map((user) => user.name);//sa returneze doar numele, nu toate informatiile ce sunt in obiectele tinute de users
    return names;
  }
  GetUser(id){
    var getUser = this.users.filter((user) => user.id === id)[0];//for each user will return 1 array, that's why [0]
    return getUser;
  }

  RemoveUser(id){
    var user = this.GetUser(id);
    if(user){
      this.users = this.users.filter((user) => user.id !== id);//delete
    }
    return user;
  }
}


module.exports = {Users};//exporting the class using ES6 destructuring
