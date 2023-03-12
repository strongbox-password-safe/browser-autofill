import { GroupSummary } from "./GroupSummary";

export class GetGroupsResponse {
    error: string | null;
    groups: GroupSummary[];
}
