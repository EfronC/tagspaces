import fsextra from 'fs-extra';
import XmpSidecar from './xmp-sidecar';
import * as paths from "path";
import { extractParentDirectoryPath, getMetaDirectoryPath } from '../utils/paths';
import { arrayBufferToBuffer } from '../utils/misc';
import AppConfig from '../config';
import uuidv1 from 'uuid';
import readdirp from 'readdirp';
import readdir from 'readdir-enhanced';
import through2 from 'through2';

export default class syncSidecar {
    constructor(pathXmp = '.', pathJson = ".") {
        this._filePathJson = pathJson;
        this._filePathXmp = pathXmp;
        this._standard = {
						  "tags": [  // A set containing the tags
						    {
						    	"id":"0", 
						    	"color":"#008000", 
						    	"description":"test", 
						    	"title":"test", 
						    	"type":"sidecar"
						    }
						  ],
						  "appVersionCreated": "2.4.1", // optional element, containing the version of tha app, created this file
						  "appName": "TagSpaces", // optional element, containing the name of the app, created this files
						  "appVersionUpdated": "2.4.1", // optional element, containing the version of the app, which last changed the file
						  "lastUpdated": "2016-06-24T12:22:38.560Z" // optional element
						}
    }

    get filePathJson() {
        return paths.format(this._filePathJson);
    }

    get filePathXmp() {
        return paths.format(this._filePathXmp);
    }

    searchFolder(path) {
    	console.log(path);
  //   	var stream = readdirp({ root: path });
		// stream
		//   .on('warn', function (err) {
		//     console.error('non-fatal error', err);
		//     // optionally call stream.destroy() here in order to abort and cause 'close' to be emitted
		//   })
		//   .on('error', function (err) { console.error('fatal error', err); })
		//   .pipe(through2.obj(function (entry, enc, next) {
		//     console.log(entry);
		//     this.push(entry);
		//     next();
		//   }));
    	readdir.stream(path)
		    .on('data', function(fileName) {})
		    .on('file', function(fileName) { 
			  	if (!fileName.endsWith(".xmp")){
        			console.log(fileName);
        			var fileNameXmp = fileName.split(".")[0];
	                fileNameXmp = fileNameXmp + ".xmp";
	                fileNameXmp = paths.join(path, fileNameXmp);
	                if (fsextra.existsSync(fileNameXmp)) {
	                	var metaFolder = paths.join(path, '.ts');
	                	var fileNameJson = paths.join(metaFolder, fileName + AppConfig.metaFileExt);
	                	this._filePathXmp = fileNameXmp;
	                	this._filePathJson = fileNameJson;
	                	this.syncSidecars();
	                };
        		} 
        	}.bind(this))
        	.on('finish', function() {
        		console.log("Fin");
        	});
    	return true;
    }

    syncSidecars() {
        if (fsextra.existsSync(this._filePathXmp)) {
			if (fsextra.existsSync(this._filePathJson)) {
				var mySidecar = new XmpSidecar(this._filePathXmp);
				var tagsJson = fsextra.readJsonSync(this._filePathJson);
				var tagsJs = this.convertFormat(tagsJson.tags);
				//let intersection = mySidecar.tags.filter(x => tagsJson.includes(x));
				let differenceJson = mySidecar.tags.filter(x => !tagsJs.includes(x));
				let differenceXmp = tagsJs.filter(x => !mySidecar.tags.includes(x));
				//let differenceS = mySidecar.tags.filter(x => !tagsJson.includes(x)).concat(tagsJson.filter(x => !mySidecar.tags.includes(x)));
				console.log(differenceJson);
				console.log(differenceXmp);
				console.log(tagsJson);
				console.log(JSON.stringify(tagsJson));
				if (differenceJson.length > 0) {
					var updatedTagsJson = this.addTags(tagsJson, differenceJson);
					console.log(updatedTagsJson);
					// /home/efrain/Documentos/Dev
					fsextra.writeJsonSync(this._filePathJson, updatedTagsJson);
				}
				if (differenceXmp.length > 0) {
					for (var i = differenceXmp.length - 1; i >= 0; i--) {
						mySidecar.addTag(differenceXmp[i]);
					}
					mySidecar.save();
				}
				return true;
			} else {
				fsextra.outputJsonSync(this._filePathJson, this._standard);
				var mySidecar = new XmpSidecar(this._filePathXmp);
				var tagsJson = fsextra.readJsonSync(this._filePathJson);
				var tagsJs = this.convertFormat(tagsJson.tags);
				//let intersection = mySidecar.tags.filter(x => tagsJson.includes(x));
				let differenceJson = mySidecar.tags.filter(x => !tagsJs.includes(x));
				if (differenceJson.length > 0) {
					var updatedTagsJson = this.addTags(tagsJson, differenceJson, true);
					console.log(updatedTagsJson);
					console.log(this._filePathJson);
					// /home/efrain/Documentos/Dev
					fsextra.writeJsonSync(this._filePathJson, updatedTagsJson);
				}
				return true;
			}
		} else {
			return false;
		}
    }

    addTags(par, tags, nova = false) {
    	if (!nova) {
    		var ex = par.tags[0];
	    	for (var i = tags.length - 1; i >= 0; i--) {
	    		par.tags.push({id:uuidv1(), color:ex.color, description:tags[i], title:tags[i], type:ex.type});
	    	}
	    	return par;
    	} else {
    		var ex = par.tags[0];
	    	for (var i = tags.length - 1; i >= 0; i--) {
	    		par.tags.push({id:uuidv1(), color:ex.color, description:tags[i], title:tags[i], type:ex.type});
	    	}
	    	par.tags.shift();
	    	console.log(par);
	    	return par;
    	}
    }

    convertFormat(tags) {
    	var formatTags = []
    	for (var i = tags.length - 1; i >= 0; i--) {
    		formatTags.push(tags[i].title);
    	}
    	return formatTags;
    }
}