export interface GetUserListItemDto {
    name: string;
    type: 0 | 1;
    actionTime: string;
}

export interface CheckUserExistRequestDto {
    user: string;
}

export interface CheckUserExistResponseDto {
    status: boolean;
}


export type GetUserListResponseDataDto = GetUserListItemDto[];