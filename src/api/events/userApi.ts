export interface GetUserListItemDto {
    name: string;
    type: 0 | 1;
    actionTime: string;
}

export type GetUserListResponseDataDto = GetUserListItemDto[];