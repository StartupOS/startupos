type User={
    id:number;
    username:string;
    given_name:string;
    family_name:string,
    email:string;
    picture?:string;
    _json?: string;
    verified_email:boolean;
    googleId?: string;
    githubId?: string;
    created_at: string;
    updated_at: string;
}
type Permission={
    subject: number | '*';
    object: string;
    verb: Verb| '*';
    context: Context | '*';
}

enum Verb {
    create= 'create',
    retrieve= 'get',
    get='get',
    update='update',
    post='update',
    put='create',
    insert='create',
    delete='delete',
    addPermission='addPermission',
    removePermission='removePermission'
}

type Context = {
    tokenAuthed? : boolean;
    inCIDR? : string;
    retries? : number;
}

type Action={
    permissions: Array<Permission>;
    [ key: string ]: any | undefined | null
}