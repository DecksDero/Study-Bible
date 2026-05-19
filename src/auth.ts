let _authenticated = false;

export const isAuthenticated = () => _authenticated;
export const authenticate = () => { _authenticated = true; };
