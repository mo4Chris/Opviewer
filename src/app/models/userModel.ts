

export interface UserModel {
    active: boolean;
    boats: {mmsi: number, nicename: string}[];
    client: string;
    password: string;
    permissions: string;
    secret2fa: string;
    token: string;
    username: string;
    _id: string;
}
