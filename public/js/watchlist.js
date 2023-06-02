let editform = document.querySelector('.editform');
let btn = document.querySelectorAll('.edit');
let c = document.querySelector('.fakeiterator').innerText;

const count = parseInt(c);
//console.log(count)
let form = document.querySelector('.form');

for(let i=0;i<count;i++){
   form.addEventListener('submit',function(e) {
        let rating = form.elements.rating.value;
        let status = form.elements.status.value;
        axios.post('/edit', {
            rating: rating,
            status: status,
            mid : mid
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    })
};


  

