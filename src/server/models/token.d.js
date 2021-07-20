/**
 * @type {{
 *  admin: boolean,
 *  demo: boolean,
 *  user_read: boolean,
 *  user_manage: boolean,
 *  dpr: {read: boolean, sov_input: string, sov_commercial: string, sov_hse: string},
 *  longterm: {read: boolean},
 *  twa: {read: boolean},
 *  forecast: {read: boolean, changeLimits: boolean, createProject: boolean},
 *  user_type: UserType,
 *  user_see_all_vessels_client: boolean,
 * }}
 */
let UserPermissions;


/**
 * @type{'admin'}
 */
let UserType;

/**
 * @type {{
 *  userID: number,
 *  userBoats: {
 *      mmsi: number,
 *      nicename: string
 *  }[];
 *  client_id: number;
 *  userCompany: string;
 *  userPermission: UserType;
 *  permission: UserPermissions;
 *  username: string;
 *  hasCampaigns: boolean;
 *  expires: number;
 *  iat: number;
 * }}
 */
let TokenModel;
module.exports = TokenModel;
