/* Map To Workers */
var workerList = [];

function addWorker() {
  workerList[workerList.length] = new Worker("pixel_worker.js");

}

var threadedJobs=[];

function addThreadedJob(jobType, environment){
    threadedJobs[threadedJobs.length]=new ThreadedJob(jobType, environment);
}

function ThreadedJob(jobType, environment){
    this.jobType = jobType;
    this.environment = environment;
}

function handleResult(resultValue, environment){

}

Object.defineProperties(Worker.prototype, {
    'isBusy':{
	get: function(){
	    return this._isBusy;
	},
	set: function(x){
	    this._isBusy = x;
	}
    }
});


