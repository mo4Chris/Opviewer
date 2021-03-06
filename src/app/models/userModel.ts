import { UserPermissions } from "./tokenModel";


export interface UserModel {
    active: boolean,
    userID: number,
    username: string,
    client_name: string,
    client_id: number,
    vessel_ids: number[],
    permission: UserPermissions,
    boats: {mmsi: number, nicename: string}[],
}
