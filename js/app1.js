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

const makeApiCall = (methodName,apiUrl,msgBody=null)=>{
    
    return new Promise((resolve,reject)=>{
        loader.classList.remove('d-none');
        let xhr = new XMLHttpRequest();

        xhr.open(methodName,apiUrl);

        xhr.onload  =function(){
            if(xhr.status>=200 && xhr.status<300){
                 
                resolve(JSON.parse(xhr.response))
            }else{
                reject(`Something went wrong!!`)
            }
            loader.classList.add('d-none');
        }

        xhr.send(JSON.stringify(msgBody))
    })

}

const onPost = (eve)=>{
    eve.preventDefault();
    let newObj={
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value
    }
    cl(newObj)
    makeApiCall("POST",POST_URL,newObj)
        .then(res=>{
            cl(res);

            let div = document.createElement('div');
            div.className=`col-md-4 mb-4`;
            newObj.id=res.id;
            div.innerHTML=`
                    <div class="card postCard h-100" id="${newObj.id}">
                    <div class="card-header">
                        <h3 class="m-0">${newObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${newObj.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick = "onRemove(this)">Delete</button>
                    </div>
                </div>
            
            
            `
            cardCon.prepend(div)
            

        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            
            postForm.reset();
            loader.classList.add('d-none');
        })

}

const onEdit = (ele)=>{
    cl(ele);
    let editId = ele.closest('.card').id;
    cl(editId);
    localStorage.setItem("editId",editId);
    

    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`;

    makeApiCall("GET",EDIT_URL)
        .then(res=>{
            cl(res);
                contentCon.value = res.body;
                titleCon.value = res.title;
                
                userIdCon.value = res.userId;
                submitBtn.classList.add('d-none');
                updateBtn.classList.remove('d-none');
                titleCon.focus();
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            loader.classList.add('d-none');
        })


}

const fetchPosts = ()=>{
    makeApiCall("GET",POST_URL)
    .then(res=>{
        cl(res);
        let postArr=[];
        for (const key in res) {
            //spread operator is used to spread the nested obj 
            //and then it is bounded in one obj with key 
           let obj = {...res[key],id:key}
            postArr.push(obj);
            cl(postArr)
        }
        templating(postArr)

    })
    .catch(err=>{
        cl(err)
    })
    .finally(()=>{
        loader.classList.add('d-none');
    })
}
fetchPosts();

const onUpdate =()=>{
    let updatedId = localStorage.getItem("editId");
    cl(updatedId);

    let UPDATE_URL = `${BASE_URL}/posts/${updatedId}.json`;

    let updatedObj ={
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value,
        
    }

    makeApiCall("PATCH",UPDATE_URL,updatedObj)
        .then(res=>{
            cl(res)
            res.id=updatedId;
            let card = [...document.getElementById(updatedId).children];
            card[0].innerHTML = `<h3 class="m-0">${updatedObj.title}</h3>`;
            card[1].innerHTML = `<p class="m-0">${updatedObj.body}</p>`
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            postForm.reset()
            loader.classList.add('d-none');
            updateBtn.classList.add("d-none");
            submitBtn.classList.remove('d-none');
        })

}

const onRemove=(ele)=>{
    let removeId = ele.closest('.card').id;
    cl(removeId)

    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`;
    makeApiCall("DELETE",REMOVE_URL)
        .then(res=>{
            cl(res)
            ele.closest('.card').parentElement.remove();
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            loader.classList.add('d-none');
        })

}

updateBtn.addEventListener("click",onUpdate)
postForm.addEventListener("submit",onPost);