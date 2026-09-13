export type Rank='pawn'|'knight'|'bishop'|'rook'|'queen'|'king';
export type Section='theory'|'algorithm'|'programming';
export type Role='owner'|'admin'|'reviewer'|'user';
export type LessonStatus='draft'|'review'|'published';
export type ContributionKind='translation'|'hint'|'solution'|'takeaway';
export interface PracticeProblem{name:string;difficulty:string;url:string}
export interface Lesson{id:string;slug:string;title:string;summary:string;section:Section;rank:Rank;difficulty:string;status:LessonStatus;contentMarkdown:string;practice:PracticeProblem[];createdAt:string;updatedAt:string}
export interface RoadmapModule{id:string;title:string;description:string;lessonIds:string[]}
export type Roadmap=Record<Section,Record<Rank,RoadmapModule[]>>;
export interface ProblemSource{id:string;name:string;slug:string;url:string;color:string}
export interface ProblemExample{input:string;output:string;explanation?:string}
export interface Problem{id:string;slug:string;source:ProblemSource;externalId:string;urlKey:string;name:string;topic:string;rating:number|null;sourceMeta?:{usacoLevel:string;contestYear:number|null;csesTopic:string};tags:string[];link:string;examples:ProblemExample[];statementDefaultLanguage:'fa'|'en';solved:boolean;authorLabel?:string;status?:string;createdAt?:string;updatedAt?:string}
export interface Statement{id:string;language:'fa'|'en';contentMarkdown:string;inputMarkdown?:string;outputMarkdown?:string;status?:string;authorLabel?:string}
export interface Education{id:string;kind:'hint'|'solution'|'takeaway';layer:number;language:'fa'|'en';title:string;contentMarkdown:string;status?:string;authorLabel?:string}
export interface ProblemDetail extends Problem{statements:Statement[];education:Education[]}
export interface PublicBootstrap{roadmap:Roadmap;lessons:Lesson[];problems:Problem[];sources:ProblemSource[]}
export interface AdminUser{id:string;username:string;email:string;displayName:string;firstName?:string;lastName?:string;grade?:string;telegramId?:string;profileImage?:string;role:Role;reviewer?:boolean;bio?:string;abilities?:Record<string,boolean>;createdAt:string}
export interface UploadedFile{id:string;originalName:string;storedName:string;url:string;size:number;mimetype:string;uploadedAt:string}
export interface SessionUser extends AdminUser{}
export interface Contribution{id:string;problemId:string;problemName:string;contributorName:string;kind:ContributionKind;language:'fa'|'en';layer:number;title:string;contentMarkdown:string;status:'pending'|'accepted'|'rejected';createdAt:string;xpAwarded?:number}
export interface ContributorRequest{id:string;userName:string;username:string;telegramId?:string;motivation:string;experience:string;status:'pending'|'approved'|'rejected';createdAt:string}
export interface ScoreboardRow{id:string;username:string;profileImage?:string;statements:number;hints:number;solutions:number;takeaways:number;problems:number;xp:number}
export interface XpSettings{statement:number;hint:number;solution:number;takeaway:number;problem:number}
export interface ProblemSubmission{id:string;problemId:string;problemName:string;sourceName:string;sourceSlug:string;externalId:string;urlKey:string;link:string;submitterName:string;submitterUsername:string;status:'pending'|'accepted'|'rejected';reviewNote?:string;publishedParts?:Record<string,unknown>;xpAwarded?:number;createdAt:string}
export interface ReviewerTicket{id:string;subject:string;body:string;status:'open'|'in_progress'|'closed';adminNote?:string;createdAt:string;reviewedAt?:string}
