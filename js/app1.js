const cl = console.log;

const loader = document.getElementById("loader");
const postForm = document.getElementById("postform");
const titleCon = document.getElementById("title");
const contentCon = document.getElementById("content");
const userIdCon = document.getElementById("userId");
const cardCon = document.getElementById("cardCon");
const BASE_URL = "https://b14-post-default-rtdb.asia-southeast1.firebasedatabase.app/";

const POST_URL = `${BASE_URL}/posts.json`;//this url will be same for post and get as it will always take json database
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
// const EDIT_URL =`${BASE_URL}/posts/:editId` >> here editId is params

const sweetAlert =(msg,icon)=>{
    sweetAlert.fire({
        title:msg,
        icon:icon,
        timer:2500
    })
}




const templating =(postArr)=>{
    let res= ``;

    postArr.forEach(ele=>{
        res+=`
          <div class="col-md-4  mb-4" >
                <div class="card postCard h-100" id="${ele.id}">
                    <div class="card-header">
                        <h3 class="m-0">${ele.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${ele.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick ="onRemove(this)">Delete</button>
                    </div>
                </div>
            </div>
        `
    })
    cardCon.innerHTML=res;
}

const makeApiCall=(methodName,apiUrl,msgBody)=>{
    return new Promise((resolve,reject)=>{
        loader.classList.remove('d-none');
        let xhr = new XMLHttpRequest();
        xhr.open(methodName,apiUrl)
        xhr.onload = function(){
            if(xhr.status>=200 && xhr.status<300){
                let data = JSON.parse(xhr.response);
                resolve(data)
            }else{
                reject(`Something Went Wrong`)
            }
            loader.classList.add("d-none");
        }
       
        xhr.send(JSON.stringify(msgBody))
    })
}

const onPost = async(eve)=>{
    eve.preventDefault();
    let newObj={
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value
    }
    cl(newObj)
    try {
        let res=  await makeApiCall("POST",POST_URL,newObj)

    newObj.id = res.name;
    let div = document.createElement('div');
    div.className = 'col-md-4  mb-4';
    div.innerHTML = `
                    <div class="card postCard h-100" id="${newObj.id}">
                    <div class="card-header">
                        <h3 class="m-0">${newObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${newObj.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick ="onRemove(this)">Delete</button>
                    </div>
                </div>
    
    
    
    
    `
    cardCon.prepend(div)
    } catch (error) {
        sweetAlert(error,`error`)
        
    }finally{
        postForm.reset();
    }
       

}

const onEdit = async(ele)=>{
    cl(ele);
    

   try {
    let editId = ele.closest('.card').id;
    cl(editId);
    localStorage.setItem("editId",editId);
    

    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`;
    
    let res= await makeApiCall("GET",EDIT_URL);

    titleCon.value = res.title;
    contentCon.value = res.body;
    userIdCon.value = res.userId
    titleCon.focus();
   } catch (error) {
        sweetAlert(error,`error`)
    
   }finally{
    updateBtn.classList.remove('d-none');
    submitBtn.classList.add('d-none');
   }
       


}

const fetchPosts =async ()=>{
  let dataobj = await  makeApiCall("GET",POST_URL)

  let postArr =[];
  for (const key in dataobj) {
    postArr.push({...dataobj[key],id:key})
  }
  templating(postArr)
   
}
fetchPosts();

const onUpdate =async()=>{
   try {
    let updatedId = localStorage.getItem("editId");
    cl(updatedId);

    let UPDATE_URL = `${BASE_URL}/posts/${updatedId}.json`;

    let updatedObj ={
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value,
        
    }

  let res = await  makeApiCall("PATCH",UPDATE_URL,updatedObj)
    let card = [...document.getElementById(updatedId).children];
    card[0].innerHTML = ` <h3 class="m-0">${updatedObj.title}</h3>`;
    card[1].innerHTML = ` <p class="m-0">${updatedObj.body}</p>`
    sweetAlert(`Post is Updated `)
   } catch (error) {
        sweetAlert(error,'error')
   }finally{
    updateBtn.classList.add('d-none');
    submitBtn.classList.remove("d-none");
    postForm.reset();
   }
        

}

const onRemove=async(ele)=>{
    try {

        let removeId = ele.closest('.card').id;
    cl(removeId)

    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`;
    await makeApiCall("DELETE",REMOVE_URL)
     ele.closest('.card').parentElement.remove()
   
       
        
    } catch (error) {
        sweetAlert(error,`error`)
    }

}

updateBtn.addEventListener("click",onUpdate)
 postForm.addEventListener("submit",onPost);