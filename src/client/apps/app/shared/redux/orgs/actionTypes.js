import { NAME as BASE } from 'shared/entities/entity';
import NAME from './constants';

export const CREATE_REQUEST = `${BASE}/${NAME}/CreateRequest`;
export const CREATE_SUCCESS = `${BASE}/${NAME}/CreateSuccess`;
export const CREATE_FAILURE = `${BASE}/${NAME}/CreateFailure`;

export const CHANGE_STATUS_REQUEST = `${BASE}/${NAME}/ChangeStatusRequest`;
export const CHANGE_STATUS_SUCCESS = `${BASE}/${NAME}/ChangeStatusSuccess`;
export const CHANGE_STATUS_FAILURE = `${BASE}/${NAME}/ChangeStatusFailure`;

export const CHANGE_EMAIL_REQUEST = `${BASE}/${NAME}/ChangeEmailRequest`;
export const CHANGE_EMAIL_SUCCESS = `${BASE}/${NAME}/ChangeEmailSuccess`;
export const CHANGE_EMAIL_FAILURE = `${BASE}/${NAME}/ChangeEmailFailure`;

export const CHANGE_INFO_REQUEST = `${BASE}/${NAME}/ChangeInfoRequest`;
export const CHANGE_INFO_SUCCESS = `${BASE}/${NAME}/ChangeInfoSuccess`;
export const CHANGE_INFO_FAILURE = `${BASE}/${NAME}/ChangeInfoFailure`;
