import fsextra from 'fs-extra';
import XmpSidecar from './xmp-sidecar';
import * as paths from "path";
import { extractParentDirectoryPath, getMetaDirectoryPath } from '../utils/paths';
import { arrayBufferToBuffer } from '../utils/misc';
import AppConfig from '../config';
import uuidv1 from 'uuid';

// function syncSidecars(pathXmp, pathJson) {
// 	if (fsextra.existsSync(pathXmp)) {
// 		if (fsextra.existsSync(pathJson)) {
// 			var mySidecar = new XmpSidecar(pathXmp);
// 			var tagsJson = fsextra.readJsonSync(pathJson);
// 			console.log(tagsJson.tags);
// 			console.log(mySidecar.tags);
// 			return True;
// 		} else {
// 			return false;
// 		}
// 	} else {
// 		return false;
// 	}
// }

export default class syncSidecar {
    constructor(pathXmp, pathJson) {
        this._filePathJson = pathJson;
        this._filePathXmp = pathXmp;
    }

    get filePathJson() {
        return path.format(this._filePathJson);
    }

    get filePathXmp() {
        return path.format(this._filePathXmp);
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
					fsextra.writeJsonSync(this._filePathJson, tagsJson);
				}
				if (differenceXmp.length > 0) {
					for (var i = differenceXmp.length - 1; i >= 0; i--) {
						mySidecar.addTag(differenceXmp[i]);
					}
					mySidecar.save();
				}
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
    }

    addTags(par, tags) {
    	var ex = par.tags[0];
    	for (var i = tags.length - 1; i >= 0; i--) {
    		par.tags.push({id:uuidv1(), color:ex.color, description:tags[i], title:tags[i], type:ex.type});
    	}
    	return par;
    }

    convertFormat(tags) {
    	var formatTags = []
    	for (var i = tags.length - 1; i >= 0; i--) {
    		formatTags.push(tags[i].title);
    	}
    	return formatTags;
    }
}