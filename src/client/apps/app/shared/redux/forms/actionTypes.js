import { NAME as BASE } from 'shared/entities/entity';
import NAME from './constants';

export const UPDATE_REQUEST = `${BASE}/${NAME}/UpdateRequest`;
export const UPDATE_SUCCESS = `${BASE}/${NAME}/UpdateSuccess`;
export const UPDATE_FAILURE = `${BASE}/${NAME}/UpdateFailure`;

export const CREATE_REQUEST = `${BASE}/${NAME}/CreateRequest`;
export const CREATE_SUCCESS = `${BASE}/${NAME}/CreateSuccess`;
export const CREATE_FAILURE = `${BASE}/${NAME}/CreateFailure`;

export const FETCH_RESPONSES_REQUEST = `${BASE}/${NAME}/FetchResponsesRequest`;
export const FETCH_RESPONSES_SUCCESS = `${BASE}/${NAME}/FetchResponsesSuccess`;
export const FETCH_RESPONSES_FAILURE = `${BASE}/${NAME}/FetchResponsesFailure`;
