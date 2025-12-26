export namespace Auth {
	
	export class Contact {
	    contact_note: string;
	    first_name: string;
	    gigatag: string;
	    id: number;
	    last_name: string;
	    user_id: number;
	    user_image: string;
	
	    static createFrom(source: any = {}) {
	        return new Contact(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.contact_note = source["contact_note"];
	        this.first_name = source["first_name"];
	        this.gigatag = source["gigatag"];
	        this.id = source["id"];
	        this.last_name = source["last_name"];
	        this.user_id = source["user_id"];
	        this.user_image = source["user_image"];
	    }
	}
	export class User {
	    id: number;
	    gigatag: string;
	    email: string;
	    phone_number?: string;
	    email_verified: boolean;
	    phone_verified: boolean;
	    first_name: string;
	    last_name: string;
	    passcode_enabled: boolean;
	    user_image: string;
	    tfa_active: boolean;
	    locked: boolean;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gigatag = source["gigatag"];
	        this.email = source["email"];
	        this.phone_number = source["phone_number"];
	        this.email_verified = source["email_verified"];
	        this.phone_verified = source["phone_verified"];
	        this.first_name = source["first_name"];
	        this.last_name = source["last_name"];
	        this.passcode_enabled = source["passcode_enabled"];
	        this.user_image = source["user_image"];
	        this.tfa_active = source["tfa_active"];
	        this.locked = source["locked"];
	    }
	}

}

export namespace chat {
	
	export class File {
	    file_name: string;
	    file_size: number;
	    file_type: string;
	    file_data: string;
	
	    static createFrom(source: any = {}) {
	        return new File(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.file_name = source["file_name"];
	        this.file_size = source["file_size"];
	        this.file_type = source["file_type"];
	        this.file_data = source["file_data"];
	    }
	}
	export class MiniUserResponse {
	    id: number;
	    gigatag: string;
	    user_image: string;
	    first_name: string;
	    last_name: string;
	
	    static createFrom(source: any = {}) {
	        return new MiniUserResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gigatag = source["gigatag"];
	        this.user_image = source["user_image"];
	        this.first_name = source["first_name"];
	        this.last_name = source["last_name"];
	    }
	}
	export class OnlineWsMessage {
	    type: string;
	    target_id: number;
	    user: MiniUserResponse;
	    content: string;
	    content_type: string;
	    uuid: string;
	    user_id: number;
	    file: File;
	
	    static createFrom(source: any = {}) {
	        return new OnlineWsMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.target_id = source["target_id"];
	        this.user = this.convertValues(source["user"], MiniUserResponse);
	        this.content = source["content"];
	        this.content_type = source["content_type"];
	        this.uuid = source["uuid"];
	        this.user_id = source["user_id"];
	        this.file = this.convertValues(source["file"], File);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace webrtc {
	
	export class RoomCreateResponse {
	    code: string;
	    code_required: boolean;
	    created_at: string;
	    id: string;
	    invitation_required: boolean;
	    room_owner: number;
	    title: string;
	    waiting_room_required: boolean;
	    max_peers: number;
	    details: string;
	    live_peers: number;
	
	    static createFrom(source: any = {}) {
	        return new RoomCreateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.code_required = source["code_required"];
	        this.created_at = source["created_at"];
	        this.id = source["id"];
	        this.invitation_required = source["invitation_required"];
	        this.room_owner = source["room_owner"];
	        this.title = source["title"];
	        this.waiting_room_required = source["waiting_room_required"];
	        this.max_peers = source["max_peers"];
	        this.details = source["details"];
	        this.live_peers = source["live_peers"];
	    }
	}
	export class Response_Desktop_Wails_Gigawrks_controllers_webrtc_RoomCreateResponse_ {
	    status_code: number;
	    error: string;
	    response: RoomCreateResponse;
	
	    static createFrom(source: any = {}) {
	        return new Response_Desktop_Wails_Gigawrks_controllers_webrtc_RoomCreateResponse_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status_code = source["status_code"];
	        this.error = source["error"];
	        this.response = this.convertValues(source["response"], RoomCreateResponse);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RoomCredResponse {
	    password: string;
	    stun_url: string;
	    turn_url: string;
	    type: string;
	    user: string;
	
	    static createFrom(source: any = {}) {
	        return new RoomCredResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.password = source["password"];
	        this.stun_url = source["stun_url"];
	        this.turn_url = source["turn_url"];
	        this.type = source["type"];
	        this.user = source["user"];
	    }
	}
	export class Response_Desktop_Wails_Gigawrks_controllers_webrtc_RoomCredResponse_ {
	    status_code: number;
	    error: string;
	    response: RoomCredResponse;
	
	    static createFrom(source: any = {}) {
	        return new Response_Desktop_Wails_Gigawrks_controllers_webrtc_RoomCredResponse_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status_code = source["status_code"];
	        this.error = source["error"];
	        this.response = this.convertValues(source["response"], RoomCredResponse);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Response___Desktop_Wails_Gigawrks_controllers_webrtc_RoomCreateResponse_ {
	    status_code: number;
	    error: string;
	    response: RoomCreateResponse[];
	
	    static createFrom(source: any = {}) {
	        return new Response___Desktop_Wails_Gigawrks_controllers_webrtc_RoomCreateResponse_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status_code = source["status_code"];
	        this.error = source["error"];
	        this.response = this.convertValues(source["response"], RoomCreateResponse);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

