export class FollowersCountResponse {
  constructor(
    readonly creatorId: number,
    readonly count: number,
  ) {}
}
