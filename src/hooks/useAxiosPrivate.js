
import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

//we are using this hook to send access token and get access token if expired
const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {

        //before sending request
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        //response after getting request, if error (token expired), in error block we are requesting again new refresh token
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                //this error block will run incase of our token expired so we are checking out error response
                //then we are getting new refresh token and retrying again
                
                const prevRequest = error?.config; //by error.config will can get the request we made

                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    //1. we are setting a property 'prevRequest', if '!prevRequest?.sent' ..that means a prevRequest (rejected request) have not been tried with new access token..
                    //so this time will set will set it to true, and we will try with access token

                    //2. again if error comes, we are in async error block, will check, now if !prevRequest?.sent == true, meaning will not enter in if block (and will throw error) because we have already tried with new acess token and this error might be our refresh toke expired that user needs to re-login 

                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;