const LocalStorage = (function(){
    const getStorage = function(){
        if(!localStorage.getItem("datas")){
            localStorage.setItem("datas",JSON.stringify({data:[], latestId:0, currentTask:null}));
            return JSON.parse(localStorage.getItem('datas'))
        }else{
            return JSON.parse(localStorage.getItem('datas'));
        };
    }
    return{
        getStorage,
    }
})();


const TaskController = (function(){
    const Task = function(id, task, deadline, dif, description){
        this.id = id;
        this.task = task;
        this.deadline = deadline;
        this.dif = dif;
        this.description = description;
    }
    const datas = LocalStorage.getStorage();

    const addTask = function(id, task, deadline, dif, description){
        const newTask = new Task(datas.latestId,task,deadline,dif, description);
        datas.data.push(newTask);
        localStorage.setItem('datas', JSON.stringify(datas));
    };

    const deleteTask = function(id){
        datas.data.forEach((task,index) =>{
            if (task.id === id){
                datas.data.splice(index,1);
                datas.currentTask = null;
                localStorage.setItem('datas', JSON.stringify(datas));
            };
        });
    };
    const updateTask = function(newTask, deadline, dif, description){
        datas.data.forEach((task,index) =>{
            if (task.id === datas.currentTask){
                task.task = newTask;
                task.deadline = deadline;
                task.dif = dif;
                task.description = description;
                datas.currentTask = null;
                localStorage.setItem('datas', JSON.stringify(datas));
            };
        });
    };

    return {
       addTask,
       datas,
       deleteTask,
       updateTask
    };
})(LocalStorage);

const UIController = (function(){
    const fieldError = "Please fill out all fields!";
    const dateError = "Date must be in the future!";
    const selectors = {
        taskName: document.querySelector('#task-name'),
        deadline: document.querySelector('#deadline'),
        difficulty: document.querySelector('#difficulty'),
        description: document.querySelector('#description'),
        submit: document.querySelector('#submit'),
        tasksContent: document.querySelector('.tasks-content'),
        delete: document.querySelector('#delete'),
        update: document.querySelector('#update'),
        back: document.querySelector('#back'),
        updateGroup: document.querySelector('.update-group')    
    };
    const checkDiff = function (diff){
        if(diff === "Difficult"){
            return 'f-red';
        }else if (diff === "Normal"){
            return 'f-normal';
        }else{
            return 'f-easy';
        }
    };

    const checkIfValid = function(){
        const today = new Date();
        const givenDate = new Date(selectors.deadline.value);
        const dif = givenDate > today;
        const date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(202[2-9])/;
        if (selectors.taskName.value.length < 1 || selectors.difficulty.value === "choose-one" || selectors.difficulty.value === "") 
        {
            return fieldError;
        }else if(date_regex.test(selectors.deadline.value) && dif){
            return "valid";
        }else{
            return dateError;
        }
    };

    const addData= function(){
        const taskName = selectors.taskName.value.charAt(0).toUpperCase() + selectors.taskName.value.slice(1);
        const deadline = selectors.deadline.value.charAt(0).toUpperCase() + selectors.deadline.value.slice(1);
        const difficulty = selectors.difficulty.value.charAt(0).toUpperCase() + selectors.difficulty.value.slice(1);
        const description = selectors.description.value;
        const color = checkDiff(difficulty);
        if(checkIfValid() === "valid"){
            const box = document.createElement('div');
            box.className = "box";
            box.id =`${TaskController.datas.latestId}`
            box.innerHTML = `
            <div class="task-controller">
            <h3>Task Name:<span>${taskName}</span></h3>
            <h3>Deadline:<span>${deadline}</span></h3>
            <h3>Difficulty:<span class="${color}" >${difficulty}</span></h3>
            <h3>Description:<span>${description}</span></h3>
            <i class="fa-regular fa-pen-to-square" id="${TaskController.datas.latestId}"></i></div>
            `;

            selectors.tasksContent.appendChild(box);
            TaskController.addTask(TaskController.datas.latestId, taskName, deadline, difficulty, description);
            TaskController.datas.latestId += 1;
            deleteInputs();
            infoTable();
        }else if(checkIfValid() === dateError){
            document.querySelector('#error').textContent = dateError;
            setTimeout(deleteError, 3000);
        }else {
            document.querySelector('#error').textContent = fieldError;
            setTimeout(deleteError, 3000);
        }  
        
    };
    
    const deleteInputs = () =>{
        selectors.taskName.value = "";
        selectors.deadline.value = "";
        selectors.difficulty.value ="choose-one";
        selectors.description.value = "";
    }

    const deleteError=() =>{
        document.querySelector("#error").textContent = "";
    }

    /*Event Listeners*/

    selectors.update.addEventListener('click', function(e){
        const taskName = selectors.taskName.value.charAt(0).toUpperCase() + selectors.taskName.value.slice(1);
        const deadline = selectors.deadline.value.charAt(0).toUpperCase() + selectors.deadline.value.slice(1);
        const difficulty = selectors.difficulty.value.charAt(0).toUpperCase() + selectors.difficulty.value.slice(1);
        const description = selectors.description.value;
        const color = checkDiff(difficulty);
        if (checkIfValid() === "valid"){
            selectors.tasksContent.childNodes.forEach(node =>{
                if(Number(node.id) === TaskController.datas.currentTask){
                    node.classList.remove('update')
                    node.innerHTML = `
                    <div class="task-controller">
                    <h3>Task Name:<span>${taskName}</span></h3>
                    <h3>Deadline:<span>${deadline}</span></h3>
                    <h3>Difficulty:<span class="${color}" >${difficulty}</span></h3>
                    <h3>Description:<span>${description}</span></h3>
                    <i class="fa-regular fa-pen-to-square" id="${TaskController.datas.currentTask}"></i></div>
                    `;
                    TaskController.updateTask(taskName,deadline,difficulty, description);
                    selectors.submit.style.display ="flex";;
                    selectors.updateGroup.style.display ="none";;
                    deleteInputs();
                    infoTable();
                }  
            })
        }else if(checkIfValid() === dateError){
            document.querySelector('#error').textContent = dateError;
            setTimeout(deleteError, 3000);
        }else{
            document.querySelector('#error').textContent = fieldError;
            setTimeout(deleteError, 3000);
        }  
        e.preventDefault();
    });

  
    selectors.submit.addEventListener('click', function(e){
        addData();
        e.preventDefault();
    });

   selectors.delete.addEventListener('click', function(e){
        selectors.tasksContent.childNodes.forEach(node =>{
        if(Number(node.id) === TaskController.datas.currentTask){
            node.remove();
            TaskController.deleteTask(TaskController.datas.currentTask);
            selectors.submit.style.display ="flex";
            selectors.updateGroup.style.display ="none";
            TaskController.datas.currentTask = null;
            deleteInputs();
            infoTable();
        }  
    })
    e.preventDefault();
   });

    selectors.tasksContent.addEventListener('click', function(e){
        if(e.target.className.includes("square")){
            e.target.parentElement.parentElement.classList.add("update")
            selectors.submit.style.display ="none";
            selectors.updateGroup.style.display ="flex";
            TaskController.datas.currentTask = Number(e.target.id);
            TaskController.datas.data.forEach(task =>{
                if(task.id === Number(e.target.id)){
                    selectors.taskName.value = task.task;
                    selectors.deadline.value = task.deadline;
                    selectors.difficulty.value = task.dif;
                    selectors.description.value = task.description;
                }
            });
        }
        e.preventDefault();
    });

/*HANDLE INFO TABLE*/
    const nextTask = ()=>{
        let next = new Date("05/12/3000");
        let soonest = "";
        TaskController.datas.data.forEach(task =>{
            let newDate = new Date(task.deadline);
            if(newDate < next){
                next = newDate;
                soonest = task.task;
            }
        })
        return soonest;
    }
    const difTasks = ()=>{
        let difCounter = 0;
        let normalCounter = 0;
        let easyCounter = 0;
        TaskController.datas.data.forEach(task =>{
            if (task.dif == "Difficult"){
                difCounter +=1;
            }else if(task.dif ==="Normal"){
                normalCounter +=1;
            }else{
                easyCounter+=1;
            }
        })
        return {difCounter, normalCounter, easyCounter};
    }
    const infoTable = function(){
        const totalTasks = TaskController.datas.data.length;
        const result = difTasks();
        const soonestTask= nextTask();
        document.querySelector('#total-task').innerHTML = `Total Tasks:<span> ${totalTasks}</span>`;
        document.querySelector('#dif-task').innerHTML = `Difficult Tasks:<span> ${result.difCounter}</span>`;
        document.querySelector('#normal-task').innerHTML = `Normal Tasks:<span> ${result.normalCounter}</span>`;
        document.querySelector('#easy-task').innerHTML = `Easy Tasks:<span> ${result.easyCounter}</span>`;
        document.querySelector('#next-task').innerHTML = `Next Task:<span> ${soonestTask}</span>`;
    }

    return {
        selectors,
        checkDiff,
        infoTable

    }
})(TaskController);


const App = (function(){
    const init = function(){
        TaskController.datas.data.forEach(task =>{
            const color = UIController.checkDiff(task.dif); 
            const box = document.createElement('div');
            box.className = "box";
            box.id =`${task.id}`
            box.innerHTML = `
            <div class="task-controller">
            <h3>Task Name:<span>${task.task}</span></h3>
            <h3>Deadline:<span>${task.deadline}</span></h3>
            <h3>Difficulty:<span class="${color}" >${task.dif}</span></h3>
            <h3>Description:<span>${task.description}</span></h3>
            <i class="fa-regular fa-pen-to-square" id="${task.id}"></i></div>
            `;
            UIController.selectors.tasksContent.appendChild(box);
            UIController.infoTable();
        });
    };
    return {
        init
    }
})(TaskController,LocalStorage,UIController);

App.init();

