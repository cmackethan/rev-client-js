declare namespace Auth {
    interface LoginResponse {
        token: string;
        /** Always "VBrick" */
        issuer: string;
        /** ISO Date format */
        expiration: string;
    }
    interface UserLoginResponse extends LoginResponse {
        email: string;
        /** User ID */
        id: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        language?: string;
    }
    interface ExtendResponse {
        /** ISO Date format */
        expiration: string;
    }
}
declare namespace OAuth {
    interface Config {
        /**
         * API key from Rev Admin -> Security. This is a DIFFERENT value from the
         *     User Token used for API login/extend session
         */
        oauthApiKey: string;
        /**
         * The local URL that Rev should redirect user to after logging in. This must
         *     match EXACTLY what's specified in Rev Admin -> Security for the
         * 	   specified API key
         */
        redirectUri: string;
    }
    /**
     * Oauth configuration object for use with buildOAuthAuthenticateURL.
     * For server-side use only.
     */
    interface ServerConfig extends Config {
        /**
         * The URL of destination Rev server
         */
        revUrl?: string;
    }
    interface LoginResponse {
        /**
        * The Vbrick access token used as "Authorization" header for subsequent requests
        */
        accessToken: string;
        /**
         * The refresh token that can be used to refresh an access_token when it expires.
         */
        refreshToken: string;
        /**
         * User Id.
         */
        userId: string;
        /**
         * Token expiration time in seconds
         */
        expiration: string;
        /**
         * The Token issuer, always "Vbrick"
         */
        issuedBy: string;
    }
    interface RedirectResponse {
        isSuccess: boolean;
        authCode: string;
        state: string;
        error?: string;
    }
}

declare type LiteralString<T> = T | (string & {
    _?: never;
});
declare type FetchResponse = Response;
declare namespace Rev {
    type HTTPMethod = LiteralString<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'>;
    interface Response<T> {
        statusCode: number;
        headers: Headers;
        body: T;
        response: FetchResponse;
    }
    interface IRevSessionState {
        token: string;
        expiration: Date | string;
        /** Required if using username login */
        userId?: string;
        /** Required if using OAuth login */
        refreshToken?: string;
        /** if using ApiKey login */
        apiKey?: string;
    }
    interface Credentials {
        /** Username of Rev User (for login) - this or apiKey must be specified */
        username?: string;
        /** Password of Rev User (for login) - this or secret must be specified */
        password?: string;
        /** API Key forRev User (for login) - this or username must be specified */
        apiKey?: string;
        /** API Secret for Rev User (for login) - this or password must be specified */
        secret?: string;
        /** authCode from oauth authorization flow */
        authCode?: string;
        /** oauth configuration values for oauth token management */
        oauthConfig?: OAuth.Config;
        /** existing token/extend session details */
        session?: Rev.IRevSessionState;
    }
    type LogSeverity = LiteralString<'debug' | 'info' | 'warn' | 'error'>;
    type LogFunction = (severity: LogSeverity, ...args: any[]) => void;
    interface Options extends Credentials {
        /** URL of Rev account */
        url: string;
        /** Logging function - default is log to console */
        log?: LogFunction;
        /** Enable/disable logging */
        logEnabled?: boolean;
        /** If true then automatically extend the Rev session at regular intervals, until
         *     rev.disconnect() is called. Optionally, pass in keepAlive options instead of `true`
         */
        keepAlive?: boolean | KeepAliveOptions;
    }
    interface IRevSession {
        token?: string;
        expires: Date;
        readonly isExpired: boolean;
        readonly username: string | undefined;
        login(): Promise<void>;
        extend(): Promise<void>;
        logoff(): Promise<void>;
        verify(): Promise<boolean>;
        lazyExtend(options?: Rev.KeepAliveOptions): Promise<boolean>;
        toJSON(): Rev.IRevSessionState;
    }
    interface RequestOptions extends Partial<RequestInit> {
        /**
         * specify body type when decoding. Use 'stream' to skip parsing body completely
         */
        responseType?: 'json' | 'text' | 'blob' | 'stream';
        /**
         * whether to throw errors or not for HTTP error response codes.
         * @default true
         */
        throwHttpErrors?: boolean;
    }
    interface ISearchRequest<T> extends AsyncIterable<T> {
        current: number;
        total?: number;
        done: boolean;
        nextPage(): Promise<SearchPage<T>>;
        exec(): Promise<T[]>;
    }
    interface SearchOptions<T> {
        /**
         * maximum number of search results
         */
        maxResults?: number;
        /**
         * callback per page
         */
        onProgress?: (items: T[], current: number, total?: number | undefined) => void;
        /**
         * Search results use a scrollID cursor that expires after 1-5 minutes
         * from first request. If the scrollID expires then onScrollExpired
         * will be called with a ScrollError. Default behavior is to throw
         * the error.
         *
         * Note that request level errors (like 401 or 500) will just be thrown as normal,
         * not passed to this function
         */
        onError?: (err: Error | ScrollError) => void;
        /**
         * Use onError instead
         * @deprecated use onError instead
         */
        onScrollError?: (err: ScrollError) => void;
    }
    interface SearchDefinition<T = any, RawType = any> {
        endpoint: string;
        totalKey: string;
        hitsKey: string;
        isPost?: boolean;
        request?: (endpoint: string, query?: Record<string, any>, options?: RequestOptions) => Promise<Record<string, any>>;
        transform?: (items: RawType[]) => T[] | Promise<T[]>;
    }
    interface KeepAliveOptions {
        /**
         * How many milliseconds between automatic extend session calls
         */
        keepAliveInterval?: number;
        /**
         * How many milliseconds before session is set to expire to
         *     proactively extend the session. Sane values are in the
         *     1-10 minutes range (default 3 min = 180000)
         * @default 180000
         */
        extendThresholdMilliseconds?: number;
        /**
         * If true (default) then make a verify API call to ensure
         * session has a valid session. Otherwise do nothing if
         * session has not expired (or within threshold)
         * @default true
         */
        verify?: boolean;
    }
    /**
     * Returned from scrollPageStream helper for each results page of a search endpoint
     */
    interface SearchPage<T> {
        items: T[];
        current: number;
        total?: number;
        done: boolean;
    }
    type SortDirection = LiteralString<'asc' | 'desc'>;
}

declare namespace AccessControl {
    type EntityType = 'User' | 'Group' | 'Role' | 'Channel';
    interface Entity {
        id: string;
        name: string;
        type: EntityType;
        canEdit: boolean;
    }
}

declare namespace Admin {
    interface CustomField {
        id: string;
        name: string;
        value: string;
        required?: boolean;
    }
    namespace CustomField {
        type Request = {
            id: string;
            name?: string;
            value: string;
        } | {
            id?: string;
            name: string;
            value: string;
        };
        interface Detail {
            id: string;
            name: string;
            value: any;
            required: boolean;
            displayedToUsers: boolean;
            type: string;
            fieldType: string;
        }
    }
    interface BrandingSettings {
        general?: {
            PrimaryColor?: string;
            PrimaryFontColor?: string;
            AccentColor?: string;
            AccentFontColor?: string;
            LogoUri?: string;
        };
        header?: {
            BackgroundColor?: string;
            FontColor?: string;
        };
    }
    interface IQCreditsSession {
        resourceId: string;
        resourceType: string;
        title: string;
        duration: string;
        initiator: {
            userId: string;
            firstName: string;
            lastName: string;
            fullName: string;
            username: string;
        };
        creator: {
            userId: string;
            firstName: string;
            lastName: string;
            fullName: string;
            username: string;
        };
        usage: string;
        credits: number;
        languages: string[];
        when: string;
    }
}

declare namespace Audit {
    export interface Options<T extends Entry> extends Rev.SearchOptions<T> {
        fromDate?: string | Date;
        toDate?: string | Date;
    }
    export interface Entry<EntityKey extends string = string> {
        messageKey: string;
        entityKey: EntityKey;
        when: string;
        principal: Record<string, string | null>;
        message: Record<string, any>;
        currentState: Record<string, any>;
        previousState: Record<string, any>;
    }
    export type UserAccessEntry = Entry<'Network.UserAccess'>;
    export type UserEntry = Entry<'Network.User'>;
    export type GroupEntry = Entry<'Network.Group'>;
    type DeviceKeys = 'Devices:DmeDevice' | 'Devices:EncoderDevice' | 'Devices:CustomDevice' | 'Devices:LdapConnectorDevice' | 'Devices:AkamaiDevice';
    export type DeviceEntry = Entry<DeviceKeys>;
    export type VideoEntry = Entry<'Media:Video'>;
    export type WebcastEntry = Entry<'ScheduledEvents:Webcast'>;
    export {};
}

interface Category {
    categoryId: string;
    name: string;
    fullPath: string;
    parentCategoryId?: string | null;
    restricted?: boolean;
}
declare namespace Category {
    export type ListItem = Omit<Category, "parentCategoryId">;
    interface BaseCategory {
        categoryId: string;
        name: string;
    }
    export interface PolicyItem {
        /**
         * Id of access control entity to give access to
         */
        id: string;
        /**
         * Type of entity (user/group)
         */
        type: "User" | "Group";
        /**
         * Category role. Only managers can edit the category itself, along with its content.
         */
        itemType: "CategoryContributor" | "CategoryManager";
    }
    export interface Details {
        categoryId: string;
        name: string;
        categoryPolicyItems: PolicyItem[] | null;
        parentCategoryId: string | null;
        restricted: boolean;
    }
    export interface EditRequest {
        /**
         * Name of category to add
         */
        name: string;
        /**
         * When true, the category is restricted and only the users/groups in categoryPolicyItems may add or edit content in the category or modify the category itself.
         */
        restricted?: boolean;
        categoryPolicyItems?: PolicyItem[];
    }
    export interface CreateRequest extends EditRequest {
        /**
         * Id of parent category to add the category as a child category. If specified, the Id needs to exist in Rev.
         */
        parentCategoryId?: string;
    }
    type Parent = BaseCategory & {
        parentCategory: null | Parent;
    };
    export interface CreateResponse extends BaseCategory {
        parentCategory?: null | Parent;
    }
    export {};
}

declare namespace Channel {
    interface Member {
        id: string;
        type: LiteralString<'User' | 'Group'>;
        roleTypes: LiteralString<'Admin' | 'Contributor' | 'Member'>[];
    }
    interface CreateRequest {
        name: string;
        description?: string;
        members?: Member[];
    }
    interface SearchHit {
        id: string;
        name: string;
        description: string;
        members: Member[];
    }
    interface SearchOptions {
        maxResults?: number;
        pageSize?: number;
        start?: number;
        onProgress?: (items: SearchHit[], current: number, total: number) => void;
    }
}

declare namespace Device {
    export type DeviceType = 'Dme' | 'Akamai' | 'AkamaiLive' | 'Custom' | 'Encoder';
    export type HealthStatusType = 'Uninitialized' | 'Initializing' | 'Healthy' | 'Warning' | 'Error' | 'Updating' | 'Normal' | 'Caution' | 'Alert';
    export interface VideoStream {
        name: string;
        url: string;
        encodingType: Video.EncodingType;
        isMulticast: boolean;
        isVbrickMulticast: boolean;
    }
    export interface ZoneDevice {
        deviceType: DeviceType;
        id: string;
        name: string;
        healthStatus: HealthStatusType;
        isVideoStorageDevice?: boolean;
        macAddresses?: string[];
        prepositionContent?: boolean;
        videoStreams?: VideoStream[];
    }
    export interface PresentationProfile {
        id: string;
        name: string;
        description: string;
        status: "Active" | "InActive";
        videoSource: string;
        destinations?: {
            deviceId: string;
            deviceName: string;
            type: string;
            isActive: boolean;
            streams: string[];
        }[];
    }
    export interface DmeDetails {
        name: string;
        id: string;
        macAddress: string;
        status: string;
        prepositionContent: boolean;
        isVideoStorageDevice: boolean;
        dmeStatus: DmeHealthStatus;
        ipAddress: string;
    }
    export interface CreateDMERequest {
        /**
         * DME device name
         */
        name: string;
        /**
         * MAC address for the DME. Must be unique to the Rev account.
         */
        macAddress: string;
        /**
         * Default=false. Specifies if the DME is currently active.
         */
        isActive?: boolean;
        /**
         * Default=false. Specifies if the DME should preposition content.
         */
        prepositionContent?: boolean;
        /**
         * Default=false. Specifies the DME as a storage device.
         */
        isVideoStorageDevice?: boolean;
        manualVideoStreams?: DmeVideoStream[];
        VideoStreamGroupsToAdd?: DmeVideoStreamGroup[];
    }
    /**
     * Used to manually add video streams to the DME.
     */
    interface DmeVideoStream {
        /**
         * Descriptive name for the stream
         */
        name: string;
        /**
         * URL of the stream
         */
        url: string;
        /**
         * Encoding type of the stream.  Values can be [h264, hls, hds, h264ts, mpeg4, mpeg2, wm]
         */
        encodingType?: LiteralString<Video.EncodingType>;
        /**
         * Specifies if the stream is a multicast stream
         */
        isMulticast?: boolean;
    }
    /**
     * Used to add an HLS stream, required for mobile devices.  This is not added by default.
     */
    interface DmeVideoStreamGroup {
        /**
         * Stream name
         */
        name: string;
        /**
         * Specify if an HLS stream is created
         */
        hasHls: boolean;
    }
    interface OriginStats {
        segmentsFailed: number;
        playlistsFailed: number;
        playlistsReceived: number;
        segmentsReceived: number;
    }
    type HealthEnum = "Uninitialized" | "Normal" | "Caution" | "Alert";
    interface MeshStatistics {
        clientHttpRequests?: number;
        clientHttpHits?: number;
        clientHttpErrors?: number;
        clientHttpKbitsIn?: number;
        clientHttpKbitsOut?: number;
        clientHttpAllMedianSvcTime?: number;
        clientHttpMissMedianSvcTime?: number;
        serverAllRequests?: number;
        serverAllErrors?: number;
        serverAllKbitsIn?: number;
        serverAllKbitsOut?: number;
        serverHttpRequests?: number;
        serverHttpErrors?: number;
        serverHttpKbitsIn?: number;
        serverHttpKbitsOut?: number;
        cpuTime?: number;
        hitsPercentageAllRequests?: number;
        hitsPercentageBitsSent?: number;
        memoryHitsPercentageHitRequests?: number;
        diskHitsPercentageHitRequests?: number;
        storageSwapSize?: number;
        storageSwapPercentageUsed?: number;
        storageMemSize?: number;
        storageMemPercentageUsed?: number;
        cacheMissesRatio?: number;
        cacheHits?: number;
        squidCpuUsage?: number;
    }
    interface HLSDistribution {
        streamId: string;
        streamName: string;
        mediaId: string;
        mediaName: string;
        mediaSource: string;
        mediaSourceType: string;
        status: string;
        statusDetail: string;
        sourceUrl: string;
        playlistsReceived: number;
        segmentsReceived: number;
        eventPlaylistReceived: number;
        eventSegmentsReceived: number;
        eventPlaylistFetchErrors: number;
        eventSegmentFetchErrors: number;
        streamReconnects: number;
        enableMulticast: boolean;
        enableReflection: boolean;
        automaticMulticast: "HighBitrate" | "LowBitrate";
        eventStarted: string;
    }
    interface DmeRecordingStatus {
        id: string;
        streamName: string;
        startDate: string;
        duration: string;
        status: string;
    }
    interface DmeServiceStatus {
        name: string;
        active: string;
        state: string;
        stateStartTime: string;
        memory: number;
    }
    interface EnrichedStreamStatus {
        typeNumeric?: number;
        stateStartTime?: number;
        inputStream?: string;
        totalPktsTx?: number;
        status?: string;
        totalEventTime?: number;
        mediaId?: string;
        mediaName?: string;
        packetsOk?: number;
        totalPktsDropped?: number;
        enrichmentType?: string;
        endTime?: string;
        url?: string;
        startTime?: string;
        reconnectAttempts?: number;
        typeVerbose?: string;
        packetsDropped?: number;
        name?: string;
        duration?: number;
        timeInCurrentState?: number;
        enrichmentRequestId?: string;
        connectionHistory?: {
            packetsDropped?: number;
            packetsTx?: number;
            connectionStartTime?: number;
            connectionEndTime?: number;
        }[];
    }
    interface PassthroughStreamStatus {
        reflectionData?: {
            playbackUrlPaths: {
                type: string;
                path: string;
            }[];
        };
        eventConfig?: {
            duration: number;
            mediaId: string;
            mediaSourceType: string;
            enableReflection: boolean;
            mediaName: string;
            autoMulticastConfig?: {
                packetSize: number;
                address: string;
                port: number;
                rendition: string;
            };
            enableMulticast: boolean;
            sourceUrl: string;
            streamName: string;
            streamId: string;
            mediaSource: string;
        };
        multicastPushData?: {
            rates: {
                bitrate: number;
                segmentsSent: number;
                state: string;
                playlistsSent: number;
                playbackUrl: string;
            }[];
        };
        type: string;
        originData: {
            sourceUrls?: {
                url: string;
                type: string;
            }[];
            currentStatus?: {
                stateStartTime: number;
                stateElapsedTime: number;
                state: string;
                eventElapsedTime: number;
                statsEventTotal: OriginStats;
                statsWindowed: OriginStats;
                eventStartTime: number;
                statsStateTotal: OriginStats;
            };
        };
    }
    interface HLSStreamStatus {
        masterStatus: string;
        cdn?: {
            isActive: number;
            pushUrl: string;
        };
        subStreams?: {
            url: string;
            name: string;
        }[];
        masterUrl?: string;
        groupName?: string;
        isMasterSub?: number;
    }
    interface MPSStreamStatus {
        status: string;
        packetsDropped: number;
        name: string;
        packetsOk: number;
        uptime: number;
        type: string;
        farIp: string;
        farPort: number;
        nearPort: number;
    }
    export interface DmeHealthStatus {
        bootTime?: string;
        systemTime?: string;
        systemVersion?: string;
        fullVersion?: string;
        ipAddress?: string;
        natAddress?: string;
        hostname?: string;
        overallHealth?: HealthEnum;
        cpuUsagePercent?: number;
        cpuUsageHealth?: HealthEnum;
        rtmpServerVersion?: string;
        rtspCpuUsagePercent?: number;
        rtmpCpuUsagePercent?: number;
        mpsConnectionCount?: number;
        mpsThroughputBitsPerSec?: number;
        mpsThroughputPercent?: number;
        throughputHealth?: HealthEnum;
        multiProtocolIncomingConnectionsCount?: number;
        multiProtocolOutgoingConnectionsCount?: number;
        mpsMulticastStreamCount?: number;
        multiProtocolMaxCount?: number;
        rtpIncomingConnectionsCount?: number;
        rtpOutgoingConnectionsCount?: number;
        rtpMulticastConnectionsCount?: number;
        rtpConnectionsMaxCount?: number;
        iScsiEnabled?: boolean;
        diskContentTotal?: number;
        diskContentUsed?: number;
        diskContentHealth?: HealthEnum;
        diskSystemTotal?: number;
        diskSystemUsed?: number;
        diskSystemHealth?: HealthEnum;
        physicalMemoryTotal?: number;
        physicalMemoryUsed?: number;
        swapMemoryUsed?: number;
        swapMemoryTotal?: number;
        memoryHealth?: HealthEnum;
        meshPeerTotalCount?: number;
        meshPeerReachableCount?: number;
        meshHealth?: HealthEnum;
        transratingActiveCount?: number;
        transratingMaxCount?: number;
        recordings?: DmeRecordingStatus[];
        sslMediaTransfer?: string;
        stbConnectorEnabled?: boolean;
        httpThroughputBitsPerSec: number;
        httpConnectionCount: number;
        throughputPhysicalBits: number;
        meshStatistics?: MeshStatistics;
        lockdownStatus: "Disabled" | "Unsupported" | "Locking" | "Enabled" | "Unlocking" | "Error";
        lockdownStatusDetail?: string;
        hlsDistributions?: HLSDistribution[];
        serviceStatus?: {
            servicesHealth: string;
            services?: DmeServiceStatus[];
        };
        numWorkers?: number;
        workers?: {
            workerNum: number;
            numRequests: number;
            hitsPercentage: number;
            restarts: number;
        }[];
        streamStatus?: {
            mpsStreams: MPSStreamStatus[];
            hlsStreams?: HLSStreamStatus[];
            passthroughStreams?: PassthroughStreamStatus[];
            enrichedStreams?: EnrichedStreamStatus[];
        };
    }
    export {};
}

declare namespace Group {
    interface Details {
        groupName: string;
        groupId: string;
        roles: Role[];
    }
    interface SearchHit {
        name: string;
        id: string;
        entityType: 'Group';
    }
    interface RawSearchHit {
        Name: string;
        Id: string;
        EntityType: 'Group';
    }
    interface CreateRequest {
        name: string;
        userIds: string[];
        roleIds: string[];
    }
}

interface User {
    userId: string;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    language: string | null;
    title: string | null;
    phone: string | null;
    groups: {
        id: string;
        name: string;
    }[];
    roles: {
        id: string;
        name: string;
    }[];
    channels: {
        id: string;
        name: string;
    }[];
    profileImageUri: string | null;
}
declare namespace User {
    interface SearchHit {
        userId: string;
        email: string | null;
        entityType: 'User';
        firstname: string;
        lastname: string;
        username: string;
    }
    interface RawSearchHit {
        Id: string;
        Email: string | null;
        EntityType: 'User';
        FirstName: string;
        LastName: string;
        UserName: string;
    }
    interface Request {
        username: string;
        email?: string;
        firstname?: string;
        lastname: string;
        title?: string;
        phoneNumber?: string;
        language?: string;
        groupIds?: string[];
        roleIds?: string[];
    }
    type DetailsLookup = LiteralString<'username' | 'email' | 'userId'>;
}

declare type FileUploadType = string | File | Blob | AsyncIterable<any>;
interface UploadFileOptions {
    /** specify filename of video as reported to Rev */
    filename?: string;
    /** specify content type of video */
    contentType?: string;
    /** if content length is known this will avoid needing to detect it */
    contentLength?: number;
    /** node-only - bypass dealing with content length and just upload as transfer-encoding: chunked */
    useChunkedTransfer?: boolean;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
}
declare function getMimeForExtension(extension?: string, defaultType?: string): string;
declare function getExtensionForMime(contentType: string, defaultExtension?: string): string;

declare namespace Video {
    type AccessControl = LiteralString<"AllUsers" | "Public" | "Private" | "Channels">;
    type ApprovalStatus = LiteralString<'Approved' | 'PendingApproval' | 'Rejected' | 'RequiresApproval' | 'SubmittedApproval'>;
    type EncodingType = LiteralString<"H264" | "HLS" | "HDS" | "H264TS" | "Mpeg4" | "Mpeg2" | "WM" | "Flash" | "RTP">;
    type ExpirationAction = LiteralString<'Delete' | 'Inactivate'>;
    type ExpiryRule = LiteralString<'None' | 'DaysAfterUpload' | 'DaysWithoutViews'>;
    type StatusEnum = LiteralString<"NotUploaded" | "Uploading" | "UploadingFinished" | "NotDownloaded" | "Downloading" | "DownloadingFinished" | "DownloadFailed" | "Canceled" | "UploadFailed" | "Processing" | "ProcessingFailed" | "ReadyButProcessingFailed" | "RecordingFailed" | "Ready">;
    type SourceType = LiteralString<'REV' | 'WEBEX' | 'API' | 'VIDEO CONFERENCE' | 'WebexLiveStream' | 'LiveEnrichment'>;
    type VideoType = LiteralString<"Live" | "Vod">;
    interface LinkedUrl {
        Url: string;
        EncodingType: EncodingType;
        Type: VideoType;
        IsMulticast: boolean;
    }
    interface SearchHit {
        id: string;
        title: string;
        description: string;
        categories: string[];
        tags: string[];
        thumbnailUrl: string;
        playbackUrl: string;
        duration: string;
        viewCount: number;
        status: string;
        approvalStatus: string;
        uploader: string;
        uploadedBy: string;
        whenUploaded: string;
        lastViewed: string;
        owner?: {
            fullname: string;
            id: string;
            username: string;
        };
        averageRating: number;
        ratingsCount: number;
        speechResult: Array<{
            time: string;
            text: string;
        }>;
        unlisted: boolean;
        whenModified: string;
        whenPublished: string;
        commentCount: number;
        score: number;
    }
    interface UploadMetadata {
        /** required - uploader of video */
        uploader: string;
        /** Title of the video being uploaded. If title is not specified, API will use uploaded filename as the title. */
        title?: string;
        /** Description - safe html will be preserved */
        description?: string;
        /** list of category names */
        categories?: string[];
        /** An array of category IDs */
        categoryIds?: string[];
        /** An array of strings that are tagged to the  */
        tags?: string[];
        /**  */
        isActive?: boolean;
        enableRatings?: boolean;
        enableDownloads?: boolean;
        enableComments?: boolean;
        /**
         * This sets access control for the  This is an enum and can have the following values: Public/AllUsers/Private/Channels.
         */
        videoAccessControl?: AccessControl;
        /**
         * This provides explicit rights to a User/Group/Collection with/without CanEdit access to a  This is an array with properties; Name (entity name), Type (User/Group/Collection), CanEdit (true/false). If any value is invalid, it will be rejected while valid values are still associated with the
         */
        accessControlEntities?: (Omit<AccessControl.Entity, 'id'> | Omit<AccessControl.Entity, 'name'>)[];
        /**
         * A Password for Public Video Access Control. Use this field when the videoAccessControl is set to Public. If not this field is ignored.
         */
        password?: string;
        /** An array of customFields that is attached to the  */
        customFields?: Admin.CustomField.Request[];
        doNotTranscode?: boolean;
        is360?: boolean;
        unlisted?: boolean;
        publishDate?: Date | string;
        userTags?: string[];
        /** owner of video, defaults to uploader. only one key is necessary */
        owner?: {
            userId?: string;
            username?: string;
            email?: string;
        };
        sourceType?: SourceType;
    }
    interface MigrateRequest {
        /** change "uploader" value to this user */
        userName?: string;
        /** change "owner" to this user. Owner takes precedence over Uploader field in sorting/UI */
        owner?: {
            userId: string;
        };
        /** When video was first uploaded (ISO Date) */
        whenUploaded?: Date | string;
        /** By default, the publishDate is set to the current date the video is
            set to Active status. You can also set the publishDate to a date in the future
            to make the video Active at that time. If the video is already Active, the
            publishDate can be set to a date in the past.
        */
        publishDate?: Date | string;
    }
    interface Details {
        /** Video ID */
        id: string;
        /** Title of the video being uploaded. If title is not specified, API will use uploaded filename as the title. */
        title: string;
        /** Description in plain text */
        description: string;
        /** Description with HTML tags included */
        htmlDescription: string;
        /** An array of strings that are tagged to the  */
        tags: string[];
        /** An array of category IDs */
        categories: string[];
        /** An array of categories with full details (id + full path) */
        categoryPaths: Array<{
            categoryId: string;
            name: string;
            fullPath: string;
        }>;
        /** An array of customFields that is attached to the  */
        customFields: Admin.CustomField[];
        /** when video was uploaded (ISO Date) */
        whenUploaded: string;
        /** When video was last modified (ISO Date) */
        whenModified: string;
        /** the full name of user who uploaded video */
        uploadedBy: string;
        owner: {
            firstName: string;
            lastName: string;
            userId: string;
            userName: string;
        };
        /** if video is active or not */
        isActive: boolean;
        /** This is the processing status of a  */
        status: StatusEnum;
        linkedUrl: LinkedUrl | null;
        approvalStatus: ApprovalStatus;
        approval: {
            status: ApprovalStatus;
            approvalProcessId: null | string;
            approvalProcessName: null | string;
            steps: Array<{
                stepId: string;
                stepName: string;
                approverName: string;
                approverId: string;
                whenRequested: string;
                whenResponded: string;
                status: string;
            }>;
            whenSubmittedForApproval: null | string;
            stepId: null | string;
            approvalProcessReferenced: boolean;
        };
        /** type of video - live or VOD */
        type: VideoType;
        /**
         * This sets access control for the  This is an enum and can have the following values: Public/AllUsers/Private/Channels.
         */
        videoAccessControl: AccessControl;
        /**
         * This provides explicit rights to a User/Group/Collection with/without CanEdit access to a  This is an array with properties; Name (entity name), Type (User/Group/Collection), CanEdit (true/false). If any value is invalid, it will be rejected while valid values are still associated with the
         */
        accessControlEntities: Array<AccessControl.Entity>;
        /**
         * A Password for Public Video Access Control. Use this field when the videoAccessControl is set to Public. If not this field is ignored.
         */
        password: string | null;
        /**
         * source of original video
         */
        sourceType: SourceType;
        source: LiteralString<'Upload' | 'Link' | 'ScheduledEvent' | 'Webex' | 'Upload360' | 'ScheduledRecording'>;
        expirationDate: string | null;
        /**
         * This sets action when video expires. This is an enum and can have the following values: Delete/Inactivate.
         */
        expirationAction: ExpirationAction | null;
        expiration: {
            ruleId: string | null;
            expirationDate: string | null;
            expiryRuleType: ExpiryRule;
            numberOfDays: number | null;
            deleteOnExpiration: boolean | null;
        } | null;
        /**
         * date video will be published
         */
        publishDate: string | null;
        lastViewed: string;
        totalViews: number;
        avgRating: number;
        ratingsCount: number;
        commentsCount: number;
        thumbnailKey: string;
        thumbnailUrl: string;
        enableRatings: boolean;
        enableDownloads: boolean;
        enableComments: boolean;
        closeCaptionsEnabled: boolean;
        unlisted: boolean;
        is360: boolean;
        userTags: Array<{
            userId: string;
            displayName: string;
        }>;
        duration: string;
        overallProgress: number;
        isProcessing: boolean;
        transcodeFailed: boolean;
        instances: Array<{
            id: string;
            isOriginalInstance: boolean;
            name: string | null;
            preset: {
                container?: string;
            };
            size: number;
            status: LiteralString<'Initialized' | 'Transcoding' | 'Transcoded' | 'TranscodingFailed' | 'Storing' | 'Stored' | 'StoringFailed'>;
            videoKey: string;
        }>;
        chapters: {
            chapters: Array<{
                extension: string;
                /** can get full URL to download as
                 * "/api/v2/media/videos/thumbnails/{{videoId}}/slides/{{imageId}}.jpg"
                 */
                imageId: string;
                time: string;
                title: string;
            }>;
        };
        hasAudioOnly: boolean;
    }
    interface PatchRequest {
        title?: string;
        categories?: string | string[];
        description?: string;
        tags?: string | string[];
        isActive?: boolean;
        expirationDate?: string | Date;
        enableRatings?: boolean;
        enableDownloads?: boolean;
        enableComments?: boolean;
        videoAccessControl?: AccessControl;
        accessControlEntities: string | string[];
        customFields: Admin.CustomField.Request[];
        unlisted?: boolean;
        userTags?: string[];
    }
    interface StatusResponse {
        videoId: string;
        title: string;
        status: StatusEnum;
        isProcessing: boolean;
        overallProgress: number;
        isActive: boolean;
        uploadedBy: string;
        whenUploaded: string;
    }
    interface SearchOptions {
        /** text to search for */
        q?: string;
        /**
         * live or vod videos
         */
        type?: VideoType;
        /**
         * list of category IDs separated by commas. pass blank to get uncategorized only
         */
        categories?: string;
        /** list of uploader names separated by commas */
        uploaders?: string;
        /** list of uploader IDs separated by commas */
        uploaderIds?: string;
        status?: LiteralString<'active' | 'inactive'>;
        fromPublishedDate?: Date | string;
        toPublishedDate?: Date | string;
        fromUploadDate?: Date | string;
        toUploadDate?: Date | string;
        fromModifiedDate?: Date | string;
        toModifiedDate?: Date | string;
        exactMatch?: boolean;
        unlisted?: LiteralString<'unlisted' | 'listed' | 'all'>;
        /**
         * If provided, the query results are fetched on the provided searchField only.
         * If the exactMatch flag is also set along with searchField, then the results are fetched for
         * an exact match on the provided searchField only.
         */
        searchField?: string;
        includeTranscriptSnippets?: boolean;
        /**
         * Show recommended videos for the specified Username. Videos returned are based on the user’s
         * last 10 viewed videos. Must be Account Admin or Media Admin to use this query. Sort order
         * must be _score. User must exist.
         */
        recommendedFor?: string;
        sortField?: LiteralString<'title' | 'whenUploaded' | 'uploaderName' | 'duration' | '_score'>;
        sortDirection?: Rev.SortDirection;
        /**
         * search for videos matching specific custom field values.
         * Object in the format {My_Custom_Field_Name: "MyCustomFieldValue"}
         */
        [key: string]: any;
    }
    interface Playback {
        id: string;
        title: string;
        categories: Category[];
        description: string;
        htmlDescription: string;
        tags: string[];
        thumbnailUrl: string;
        playbackUrl: string;
    }
    interface VideoReportEntry {
        videoId: string;
        title: string;
        username: string;
        firstName: string;
        lastName: string;
        emailAddress: string;
        completed: boolean;
        zone: string;
        device: string;
        browser: string;
        userDeviceType: string;
        playbackUrl: string;
        dateViewed: string;
        viewingTime: string;
        viewingStartTime: string;
        viewingEndTime: string;
    }
    interface VideoReportOptions extends Rev.SearchOptions<VideoReportEntry> {
        videoIds?: string | string[] | undefined;
        startDate?: Date | string;
        endDate?: Date | string;
        incrementDays?: number;
        sortDirection?: Rev.SortDirection;
    }
    interface Comment {
        id: string;
        text: string;
        date: string;
        username: string;
        firstName: string;
        lastName: string;
        isRemoved: boolean;
        childComments: Comment[];
    }
    namespace Comment {
        interface Request {
            /**
             * The text of the comment
             */
            comment: string;
            /**
             * Username submitting the comment. This user must exist in Rev. Unless
             * the user has been assigned the Account Admin role, this user must
             * also match the authenticated user making the API call.
             */
            userName: string;
            /**
             * If not provided, parent comment will be created. If parent commentId
             * is provided, then it will create child comment to that parent. If
             * child commentid is provided, then child comment for the corresponding
             * parent comment will be created.
             */
            commentId?: string;
        }
        interface ListResponse {
            id: string;
            title: string;
            comments: Comment[];
        }
    }
    interface Chapter {
        title: string;
        startTime: string;
        imageUrl: string;
    }
    namespace Chapter {
        interface Request {
            /**
             * time in 00:00:00 format
             */
            time: string;
            title?: string;
            imageFile?: FileUploadType;
        }
    }
    interface SupplementalFile {
        downloadUrl: string;
        fileId: string;
        size: number;
        title: string;
    }
    interface Transcription extends SupplementalFile {
        locale: string;
    }
    namespace Transcription {
        type SupportedLanguages = LiteralString<'de' | 'en' | 'en-gb' | 'es-es' | 'es-419' | 'es' | 'fr' | 'fr-ca' | 'id' | 'it' | 'ko' | 'ja' | 'nl' | 'no' | 'pl' | 'pt' | 'pt-br' | 'th' | 'tr' | 'fi' | 'sv' | 'ru' | 'el' | 'zh' | 'zh-tw' | 'zh-cmn-hans'>;
    }
}

interface Playlist {
    id: string;
    name: string;
    playbackUrl: string;
    videos: Array<{
        id: string;
        title: string;
    }>;
}
declare namespace Playlist {
    interface List {
        featuredPlaylist?: Playlist;
        playlists: Playlist[];
    }
    interface UpdateAction {
        /**
         * Video Ids to edit in the playlist
         */
        videoId: string;
        /**
         * Action to be taken - Add or Remove.
         */
        action: "Add" | "Remove";
    }
}

declare namespace Recording {
    interface PresentationProfileRequest {
        presentationProfileId: string;
        useAccountRecordingDevice?: boolean;
        startDate?: string | Date;
        endDate?: string | Date;
        title?: string;
    }
    interface PresentationProfileStatus {
        startDate: string;
        endDate: string;
        status: Video.StatusEnum;
    }
    interface StopPresentationProfileResponse {
        recordingVideoId: string;
        status: Video.StatusEnum;
    }
}

interface Webcast {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    listingType: Webcast.WebcastAccessControl;
    eventUrl: string;
    backgroundImages: Array<{
        url: string;
        scaleSize: string;
    }>;
    categories: Array<{
        categoryId: string;
        name: string;
        fullpath: string;
    }>;
    tags: string[];
    unlisted: boolean;
    estimatedAttendees: number;
    lobbyTimeMinutes: number;
    preProduction: {
        /**
         * format: HH:MM
         */
        duration: string;
        userIds: string[];
        groupIds: string[];
    };
    shortcutName: string;
}
declare namespace Webcast {
    type WebcastAccessControl = LiteralString<'Public' | 'TrustedPublic' | 'AllUsers' | 'Private'>;
    type SortField = LiteralString<'startDate' | 'title'>;
    type VideoSourceType = LiteralString<'Capture' | 'MicrosoftTeams' | 'PresentationProfile' | 'Rtmp' | 'WebrtcSinglePresenter' | 'SipAddress' | 'WebexTeam' | 'WebexEvents' | 'WebexLiveStream' | 'Vod' | 'Zoom'>;
    type RealtimeField = LiteralString<'FullName' | 'Email' | 'ZoneName' | 'StreamType' | 'IpAddress' | 'Browser' | 'OsFamily' | 'StreamAccessed' | 'PlayerDevice' | 'OsName' | 'UserType' | 'Username' | 'AttendeeType'>;
    interface ListRequest {
        after?: string | Date;
        before?: string | Date;
        sortField?: SortField;
        sortDirection?: Rev.SortDirection;
    }
    interface SearchRequest {
        startDate?: string | Date;
        endDate?: string | Date;
        /**
         * Name of the field in the event that will be used to sort the dataset in the response. Default is 'StartDate'
         */
        sortField?: SortField;
        /**
          * Sort direction of the dataset. Values supported: 'asc' and 'desc'. Default is 'asc'.
          */
        sortDirection?: Rev.SortDirection;
        /**
          * Number of records in the dataset to return per search request. Default is 100, minimum is 50 and maximum is 500.
          */
        size?: number;
        /**
          * List of custom fields to use when searching for events. All of the fields provided are concatenated as AND in the search request. The value to the property 'Value' is required.
          */
        customFields?: Admin.CustomField.Request[];
    }
    interface CreateRequest {
        title: string;
        description?: string;
        startDate: string | Date;
        endDate: string | Date;
        presentationProfileId?: string;
        vcSipAddress?: string;
        isSecureRtmp?: boolean;
        /** only valid for edit request - Specifies if the exiting RTMP based webcast URL and Key needs to be regenerated */
        regenerateRtmpUrlAndKey?: boolean;
        vcMicrosoftTeamsMeetingUrl?: string;
        /** This field is required to create/edit WebexLiveStream event. */
        videoSourceType?: VideoSourceType;
        webcastType?: LiteralString<'Rev' | 'WebexEvents'>;
        webexTeam?: {
            roomId: string;
            name?: string;
        };
        zoom?: {
            meetingId: string;
            meetingPassword?: string;
        };
        vodId?: string;
        /** Internal user Id. Only required when 'WebrtcSinglePresenter' selected as a videoSourceType */
        presenterId?: string;
        eventAdminIds: string[];
        automatedWebcast?: boolean;
        closedCaptionsEnabled?: boolean;
        pollsEnabled?: boolean;
        chatEnabled?: boolean;
        questionAndAnswerEnabled?: boolean;
        userIds?: string[];
        groupIds?: string[];
        moderatorIds?: string[];
        password?: string;
        accessControl: WebcastAccessControl;
        questionOption?: string;
        presentationFileDownloadAllowed?: boolean;
        categories?: string[];
        tags?: string[];
        unlisted?: boolean;
        estimatedAttendees?: number;
        lobbyTimeMinutes?: number;
        preProduction?: {
            duration?: string;
            userIds?: string[];
            groupIds?: string[];
        };
        shortcutName?: string;
        recordingUploaderUserEmail?: string;
        recordingUploaderUserId?: string;
        disableAutoRecording?: boolean;
        hideShareUrl?: boolean;
        autoplay?: boolean;
        linkedVideoId?: string;
        autoAssociateVod?: boolean;
        redirectVod?: boolean;
        registrationFieldIds?: string[];
        customFields?: Admin.CustomField.Request[];
        liveSubtitles?: {
            sourceLanguage: string;
            translationLanguages: string[];
        };
        emailToPreRegistrants?: boolean;
    }
    interface Details {
        eventId: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        presentationProfileId?: string;
        vcSipAddress?: string;
        vcMicrosoftTeamsMeetingUrl?: string;
        videoSourceType?: VideoSourceType;
        webcastType?: LiteralString<'Rev' | 'WebexEvents'>;
        webexTeam?: {
            roomId: string;
            name?: string;
        };
        zoom?: {
            meetingId: string;
            meetingPassword?: string;
        };
        vodId?: string;
        rtmp?: {
            url: string;
            key: string;
        };
        liveSubtitles?: {
            sourceLanguage: string;
            translationLanguages: string[];
        };
        eventAdminIds: string[];
        automatedWebcast: boolean;
        closedCaptionsEnabled: boolean;
        pollsEnabled: boolean;
        chatEnabled: boolean;
        questionOption: string;
        questionAndAnswerEnabled: boolean;
        userIds: string[];
        groupIds: string[];
        moderatorIds: string[];
        password: string;
        accessControl: WebcastAccessControl;
        categories: Array<{
            categoryId: string;
            name: string;
            fullpath: string;
        }>;
        tags?: string[];
        unlisted: boolean;
        estimatedAttendees: number;
        lobbyTimeMinutes: number;
        preProduction?: {
            duration: string;
            userIds: string[];
            groupIds: string[];
        };
        shortcutName: string;
        shortcutNameUrl: string;
        linkedVideoId: string;
        autoAssociateVod: boolean;
        redirectVod: boolean;
        recordingUploaderUserId: string;
        disableAutoRecording?: boolean;
        hideShareUrl?: boolean;
        autoplay?: boolean;
        presentationFileDownloadAllowed: boolean;
        registrationFields: RegistrationField[];
        customFields?: Admin.CustomField[];
        emailToPreRegistrants?: boolean;
    }
    interface EditAttendeesRequest {
        userIds?: string[];
        usernames?: string[];
        groupIds?: string[];
    }
    interface PostEventSummary {
        hostCount?: number;
        moderatorCount?: number;
        attendeeCount?: number;
        experiencedRebufferingPercentage?: number;
        averageExperiencedRebufferDuration?: number;
        experiencedErrorsPerAttendees?: number;
        multicastErrorsPerAttendees?: number;
        totalSessions?: number;
        totalPublicCDNTime?: string;
        totalECDNTime?: string;
    }
    interface PostEventSession {
        userType: string;
        name: string;
        username: string;
        email: string;
        ipAddress: string;
        browser: string;
        deviceType: string;
        zone: string;
        deviceAccessed: string;
        streamAccessed: string;
        sessionTime: string;
        viewingTime: string;
        enteredDate: string;
        exitedDate: string;
        viewingStartTime: string;
        experiencedErrors: number;
        multicastErrorsPerAttendees: number;
        bufferEvents: number;
        rebufferEvents: number;
        rebufferDuration: number;
        attendeeType: LiteralString<'Host' | 'Moderator' | 'AccountAdmin' | 'Attendee'>;
    }
    interface RealtimeRequest {
        sortField?: RealtimeField;
        sortDirection?: Rev.SortDirection;
        count?: number;
        q?: string;
        searchField?: RealtimeField;
        runNumber?: number;
        status?: LiteralString<'All' | 'Online' | 'Offline'>;
        attendeeDetails?: LiteralString<'Base' | 'All' | 'Counts'>;
    }
    interface RealtimeSummary {
        totalSessions?: number;
        hostCount?: number;
        moderatorCount?: number;
        attendeeCount?: number;
        status?: LiteralString<'Active' | 'Initiated'>;
        experiencedRebufferingPercentage?: number;
        averageExperiencedRebufferDuration?: number;
        experiencedErrorsPerAttendees?: number;
        multicastErrorsPerAttendees?: number;
    }
    interface RealtimeSession {
        userId: string;
        username: string;
        fullName: string;
        email: string;
        startTime: string;
        sessionId: string;
    }
    interface RealtimeSessionDetail extends RealtimeSession {
        userType: string;
        attendeeType: LiteralString<'Host' | 'Moderator' | 'AccountAdmin' | 'Attendee'>;
        status: LiteralString<'Online' | 'Offline'>;
        experiencedErrors: number;
        multicastFailovers: number;
        experiencedBufferingDuration: number;
        experiencedBufferingCount: number;
        avgExperiencedBufferingDuration: number;
        avgBitrateKbps: number;
        avgBandwidthMbps: number;
        viewingStartTime: number;
        zoneId: string;
        zoneName: string;
        ipAddress: string;
        streamDevice: string;
        streamAccessed: string;
        playerDevice: string;
        browser: string;
        videoPlayer: string;
        videoFormat: string;
        userAgent: string;
        osName: string;
        osFamily: string;
        deviceId: string;
        revConnect: boolean;
        streamType: string;
        sessionId: string;
        profileImageUrl: string;
    }
    interface Question {
        whenAsked: string;
        question: string;
        askedBy: string;
        repliedBy: string;
        lastAction: string;
        reply: string;
        isPublic: boolean;
    }
    interface PollResults {
        question: string;
        totalResponses: number;
        totalNoResponses: number;
        allowMultipleAnswers: boolean;
        whenPollCreated: string;
        pollAnswers: Array<{
            answer: string;
            votes: 0;
        }>;
    }
    interface Comment {
        username: string;
        date: string;
        comment: string;
    }
    interface Status {
        eventTitle: string;
        startDate: string;
        endDate: string;
        eventStatus: LiteralString<'Completed' | 'Scheduled' | 'Starting' | 'InProgress' | 'Broadcasting' | 'Deleted' | 'Recording' | 'RecordingStarting' | 'RecordingStopping' | 'VideoSourceStarting'>;
        slideUrl: string;
        isPreProduction: boolean;
    }
    interface PlaybackUrlRequest {
        ip?: string;
        userAgent?: string;
    }
    interface Playback {
        label: string;
        qValue: number;
        player: string;
        url: string;
        zoneId: string;
        slideDelaySeconds: number;
        videoFormat: string;
        videoInstanceId: string;
        deviceId: string;
    }
}
interface GuestRegistration {
    name: string;
    email: string;
    registrationId: string;
    registrationFieldsAnswers: Array<{
        id: string;
        name: string;
        value: string;
    }>;
}
declare namespace GuestRegistration {
    interface Details extends GuestRegistration {
        token: string;
    }
    interface Request {
        name: string;
        email: string;
        registrationFieldsAnswers?: Array<{
            id?: string;
            name?: string;
            value: string;
        }>;
    }
    interface SearchRequest {
        sortField?: LiteralString<'name' | 'email'>;
        sortDirection?: Rev.SortDirection;
        size?: number;
    }
}

interface Zone {
    id: string;
    parentZoneId?: string | null;
    name: string;
    supportsMulticast: boolean;
    ipAddresses?: string[];
    ipAddressRanges?: Array<{
        start: string;
        end: string;
    }>;
    targetDevices: Zone.TargetDevice[];
    childZones?: Zone[];
    slideDelay?: {
        overrideAccount: boolean;
        isEnabled: boolean;
        delaySeconds: number;
    };
    revConnectEnabled?: boolean;
    revConnectSetting?: null | {
        disableFallback: boolean;
        maxZoneMeshes: number;
        groupPeersByZoneIPAddresses: boolean;
        revConnectConfig?: null | Record<string, any>;
    };
}
declare namespace Zone {
    interface CreateRequest {
        id?: string;
        parentZoneId?: string;
        ipAddresses?: string[];
        ipAddressRanges?: Array<{
            start: string;
            end: string;
        }>;
        targetDevices?: TargetDeviceRequest[];
        supportsMulticast?: boolean;
        overrideAccountSlideDelay?: boolean;
        slideDelaySeconds?: number;
        revConnectEnabled?: boolean;
        revConnectSetting?: {
            /**
             * Disables fallback to a unicast stream (if available) which means the zone only supports multicast or Rev Connect.
             */
            disableFallback?: boolean;
            /**
              * 0; Defines the upper limit of what can be used within the zone based on licensing retrictions.
              */
            maxZoneMeshes?: number;
            groupPeersByZoneIPAddresses?: boolean;
        };
    }
    interface TargetDevice {
        /**
         * Possible settings can be 'Custom', 'Encoder', 'Dme', 'Akamai'
         */
        deviceType: 'Custom' | 'Encoder' | 'Dme' | 'Akamai';
        /**
         * Device Id of target device
         */
        deviceId: string;
        /**
         * Status of target device
         */
        isActive: boolean;
        /**
         * Specifies if no VOD videos retrieved if true
         */
        liveOnly: boolean;
        /**
         * Rev stream names added to the zone from this device
         */
        streams: string[];
    }
    interface TargetDeviceRequest {
        /**
         * Possible settings can be 'Custom', 'Encoder', 'Dme', 'Akamai'
         */
        deviceType: 'Custom' | 'Encoder' | 'Dme' | 'Akamai';
        /**
          * Device Id of target device
          */
        deviceId: string;
        /**
          * Status of target device
          */
        isActive?: boolean;
        /**
          * Specifies if no VOD videos retrieved if true
          */
        liveOnly?: boolean;
        /**
          * Rev stream names added to the zone from this device
          */
        streams: string[];
    }
    type FlatZone = Omit<Zone, 'childZones'>;
}

interface Role {
    id: string;
    name: Role.RoleName;
}
declare namespace Role {
    type RoleName = LiteralString<'Account Admin' | 'Media Admin' | 'Media Contributor' | 'Media Viewer' | 'Event Admin' | 'Event Host' | 'Channel Creator' | 'Category Creator'>;
    type Details = Role & {
        description: string;
    };
}
interface RegistrationField {
    id: string;
    name: string;
    fieldType: LiteralString<'Text' | 'Select'>;
    required: boolean;
    options?: string[];
    includeInAllWebcasts: boolean;
}
declare namespace RegistrationField {
    interface Request {
        name: string;
        /** @default: text */
        fieldType?: LiteralString<'Text' | 'Select'>;
        /** @default: false */
        required?: boolean;
        options?: string[];
        includeInAllWebcasts?: boolean;
    }
}

interface IPageResponse<T> {
    items: T[];
    done: boolean;
    total?: number;
    pageCount?: number;
    error?: Error;
}
/**
 * Interface to iterate through results from API endpoints that return results in pages.
 * Use in one of three ways:
 * 1) Get all results as an array: await request.exec() == <array>
 * 2) Get each page of results: await request.nextPage() == { current, total, items: <array> }
 * 3) Use for await to get all results one at a time: for await (let hit of request) { }
 */
declare abstract class PagedRequest<ItemType> implements Rev.ISearchRequest<ItemType> {
    current: number;
    total: number | undefined;
    done: boolean;
    options: Required<Rev.SearchOptions<ItemType>>;
    constructor(options?: Rev.SearchOptions<ItemType>);
    protected abstract _requestPage(): Promise<IPageResponse<ItemType>>;
    /**
     * Get the next page of results from API
     */
    nextPage(): Promise<Rev.SearchPage<ItemType>>;
    /**
     * update internal variables based on API response
     * @param page
     * @returns
     */
    protected _parsePage(page: IPageResponse<ItemType>): {
        current: number;
        total: number | undefined;
        done: boolean;
        error: Error | undefined;
        items: ItemType[];
    };
    /**
     * Go through all pages of results and return as an array.
     * TIP: Use the {maxResults} option to limit the maximum number of results
     *
     */
    exec(): Promise<ItemType[]>;
    [Symbol.asyncIterator](): AsyncGenerator<ItemType, void, unknown>;
}

/**
 * Interface to iterate through results from API endpoints that return results in pages.
 * Use in one of three ways:
 * 1) Get all results as an array: await request.exec() == <array>
 * 2) Get each page of results: await request.nextPage() == { current, total, items: <array> }
 * 3) Use for await to get all results one at a time: for await (let hit of request) { }
 */
declare class SearchRequest<T> extends PagedRequest<T> {
    options: Required<Rev.SearchOptions<T>>;
    private query;
    private _reqImpl;
    constructor(rev: RevClient, searchDefinition: Rev.SearchDefinition<T>, query?: Record<string, any>, options?: Rev.SearchOptions<T>);
    protected _requestPage(): Promise<IPageResponse<T>>;
    private _buildReqFunction;
}

declare type CacheOption = boolean | 'Force';
declare function adminAPIFactory(rev: RevClient): {
    /**
    * get mapping of role names to role IDs
    * @param cache - if true allow storing/retrieving from cached values. 'Force' means refresh value saved in cache
    */
    roles(cache?: CacheOption): Promise<Role.Details[]>;
    /**
    * Get a Role (with the role id) based on its name
    * @param name Name of the Role, i.e. "Media Viewer"
    * @param fromCache - if true then use previously cached Role listing (more efficient)
    */
    getRoleByName(name: Role.RoleName, fromCache?: CacheOption): Promise<Role>;
    /**
    * get list of custom fields
    * @param cache - if true allow storing/retrieving from cached values. 'Force' means refresh value saved in cache
    */
    customFields(cache?: CacheOption): Promise<Admin.CustomField[]>;
    /**
    * Get a Custom Field based on its name
    * @param name name of the Custom Field
    * @param fromCache if true then use previously cached Role listing (more efficient)
    */
    getCustomFieldByName(name: string, fromCache?: CacheOption): Promise<Admin.CustomField>;
    brandingSettings(): Promise<Admin.BrandingSettings>;
    webcastRegistrationFields(): Promise<RegistrationField & {
        id: string;
    }>;
    createWebcastRegistrationField(registrationField: RegistrationField.Request): Promise<string>;
    updateWebcastRegistrationField(fieldId: string, registrationField: Partial<RegistrationField.Request>): Promise<void>;
    deleteWebcastRegistrationField(fieldId: string): Promise<void>;
    listIQCreditsUsage(query: {
        startDate?: string | Date;
        endDate?: string | Date;
    }, options?: Rev.SearchOptions<Admin.IQCreditsSession> | undefined): SearchRequest<Admin.IQCreditsSession>;
    /**
    * get system health - returns 200 if system is active and responding, otherwise throws error
    */
    verifySystemHealth(): Promise<boolean>;
    /**
    * gets list of scheduled maintenance windows
    */
    maintenanceSchedule(): Promise<{
        start: string;
        end: string;
    }[]>;
};

declare class AuditRequest<T extends Audit.Entry> extends PagedRequest<T> {
    options: Required<Omit<Audit.Options<T>, 'toDate' | 'fromDate'>>;
    private params;
    private _req;
    constructor(rev: RevClient, endpoint: string, label?: string, { toDate, fromDate, ...options }?: Audit.Options<T>);
    protected _requestPage(): Promise<IPageResponse<T>>;
    private _buildReqFunction;
    private _parseDates;
}

declare function auditAPIFactory(rev: RevClient): {
    /**
    * Logs of user login / logout / failed login activity
    */
    accountAccess(accountId: string, options?: Audit.Options<Audit.UserAccessEntry> | undefined): AuditRequest<Audit.UserAccessEntry>;
    userAccess(userId: string, accountId: string, options?: Audit.Options<Audit.UserAccessEntry> | undefined): AuditRequest<Audit.UserAccessEntry>;
    /**
    * Operations on User Records (create, delete, etc)
    */
    accountUsers(accountId: string, options?: Audit.Options<Audit.UserEntry> | undefined): AuditRequest<Audit.UserEntry>;
    user(userId: string, accountId: string, options?: Audit.Options<Audit.UserEntry> | undefined): AuditRequest<Audit.UserEntry>;
    /**
    * Operations on Group Records (create, delete, etc)
    */
    accountGroups(accountId: string, options?: Audit.Options<Audit.GroupEntry> | undefined): AuditRequest<Audit.GroupEntry>;
    group(groupId: string, accountId: string, options?: Audit.Options<Audit.GroupEntry> | undefined): AuditRequest<Audit.GroupEntry>;
    /**
    * Operations on Device Records (create, delete, etc)
    */
    accountDevices(accountId: string, options?: Audit.Options<Audit.DeviceEntry> | undefined): AuditRequest<Audit.DeviceEntry>;
    device(deviceId: string, accountId: string, options?: Audit.Options<Audit.DeviceEntry> | undefined): AuditRequest<Audit.DeviceEntry>;
    /**
    * Operations on Video Records (create, delete, etc)
    */
    accountVideos(accountId: string, options?: Audit.Options<Audit.VideoEntry> | undefined): AuditRequest<Audit.VideoEntry>;
    video(videoId: string, accountId: string, options?: Audit.Options<Audit.VideoEntry> | undefined): AuditRequest<Audit.VideoEntry>;
    /**
    * Operations on Webcast Records (create, delete, etc)
    */
    accountWebcasts(accountId: string, options?: Audit.Options<Audit.WebcastEntry> | undefined): AuditRequest<Audit.WebcastEntry>;
    webcast(eventId: string, accountId: string, options?: Audit.Options<Audit.WebcastEntry> | undefined): AuditRequest<Audit.WebcastEntry>;
    /**
    * All operations a single user has made
    */
    principal(userId: string, accountId: string, options?: Audit.Options<Audit.Entry<string>> | undefined): AuditRequest<Audit.Entry<string>>;
};

/**
 * Constructs the query parameters for the Rev /oauth/authorization endpoint
 * @param config OAuth signing settings, retrieved from Rev Admin -> Security -> API Keys page, along with revUrl
 * @param state optional state to pass back to redirectUri once complete
 * @returns A valid oauth flow endpoint + query
 */
declare function buildOAuthAuthenticationQuery(config: OAuth.Config, oauthSecret: string, state?: string): Promise<{
    apiKey: string;
    signature: string;
    verifier: string;
    redirect_uri: string;
    response_type: string;
    state: string;
}>;
/**
 * Parse the query parameters returned to the redirectUri from Rev
 * @param url The URL with query parameters, or object with the query parrameters
 * @returns
 */
declare function parseOAuthRedirectResponse(url: string | URL | URLSearchParams | Record<string, string>): OAuth.RedirectResponse;

declare function authAPIFactory(rev: RevClient): {
    loginToken(apiKey: string, secret: string): Promise<Auth.LoginResponse>;
    extendSessionToken(apiKey: string): Promise<Auth.ExtendResponse>;
    logoffToken(apiKey: string): Promise<void>;
    loginUser(username: string, password: string): Promise<Auth.UserLoginResponse>;
    logoffUser(userId: string): Promise<void>;
    extendSessionUser(userId: string): Promise<Auth.ExtendResponse>;
    verifySession(): Promise<void>;
    /**
     * @deprecated - use logoffUser - put here because it's a common misspelling
     */
    readonly logoutUser: (userId: string) => Promise<void>;
    /**
     * @deprecated - use logoffToken - put here because it's a common misspelling
     */
    readonly logoutToken: (apiKey: string) => Promise<void>;
    /**
     *
     * @param config OAuth signing settings, retrieved from Rev Admin -> Security -> API Keys page
     * @param oauthSecret Secret from Rev Admin -> Security. This is a DIFFERENT value from the
     *                    User Secret used for API login. Do not expose client-side!
     * @param state optional state to pass back to redirectUri once complete
     * @returns A valid oauth flow URL
     */
    buildOAuthAuthenticationURL(config: OAuth.Config, oauthSecret: string, state?: string): Promise<string>;
    buildOAuthAuthenticationQuery: typeof buildOAuthAuthenticationQuery;
    parseOAuthRedirectResponse: typeof parseOAuthRedirectResponse;
    loginOAuth(config: OAuth.Config, authCode: string): Promise<OAuth.LoginResponse>;
    extendSessionOAuth(config: OAuth.Config, refreshToken: string): Promise<OAuth.LoginResponse>;
};

declare function categoryAPIFactory(rev: RevClient): {
    create(category: Category.CreateRequest): Promise<Category.CreateResponse>;
    details(categoryId: string): Promise<Category.Details>;
    update(categoryId: string, category: Category.EditRequest): Promise<void>;
    delete(categoryId: string): Promise<void>;
    /**
     * get list of categories in system
     * @see {@link https://revdocs.vbrick.com/reference#getcategories}
     */
    list(parentCategoryId?: string | undefined, includeAllDescendants?: boolean | undefined): Promise<Category[]>;
};

declare function channelAPIFactory(rev: RevClient): {
    create(channel: Channel.CreateRequest): Promise<string>;
    update(channelId: string, channel: Channel.CreateRequest): Promise<void>;
    delete(channelId: string): Promise<void>;
    /**
     * get list of channels in system
     * @see {@link https://revdocs.vbrick.com/reference/getchannels}
     */
    list(start?: number, options?: Channel.SearchOptions): ChannelListRequest;
    addMembers(channelId: string, members: Channel.Member[]): Promise<void>;
    removeMembers(channelId: string, members: Array<string | Channel.Member>): Promise<void>;
};
declare class ChannelListRequest implements Rev.ISearchRequest<Channel.SearchHit> {
    currentPage: number;
    current: number;
    total: number;
    done: boolean;
    options: Required<Pick<Channel.SearchOptions, 'maxResults' | 'onProgress' | 'pageSize'>>;
    private _req;
    constructor(rev: RevClient, start?: number, options?: Channel.SearchOptions);
    nextPage(): Promise<{
        current: number;
        total: number;
        done: boolean;
        items: Channel.SearchHit[];
    }>;
    /**
     * Go through all pages of results and return as an array.
     * TIP: Use the {maxResults} option to limit the maximum number of results
     *
     */
    exec(): Promise<Channel.SearchHit[]>;
    [Symbol.asyncIterator](): AsyncGenerator<Channel.SearchHit, void, unknown>;
}

declare function deviceAPIFactory(rev: RevClient): {
    listDMEs(): Promise<Device.DmeDetails[]>;
    listZoneDevices(): Promise<Device.ZoneDevice[]>;
    listPresentationProfiles(): Promise<Device.PresentationProfile[]>;
    add(dme: Device.CreateDMERequest): Promise<any>;
    healthStatus(deviceId: string): Promise<Device.DmeHealthStatus>;
    delete(deviceId: string): Promise<void>;
    rebootDME(deviceId: string): Promise<any>;
};

declare function groupAPIFactory(rev: RevClient): {
    /**
     * Create a group. Returns the resulting Group ID
     * @param {{name: string, userIds: string[], roleIds: string[]}} group
     * @returns {Promise<string>}
     */
    create(group: Group.CreateRequest): Promise<any>;
    delete(groupId: string): Promise<void>;
    details(groupId: string): Promise<Group.Details>;
    /**
     *
     * @param {string} [searchText]
     * @param {Rev.SearchOptions<{Id: string, Name: string}>} [options]
     */
    search(searchText?: string | undefined, options?: Rev.SearchOptions<Group.SearchHit>): SearchRequest<Group.SearchHit>;
    list(options?: Rev.SearchOptions<Group.SearchHit>): SearchRequest<Group.SearchHit>;
    listUsers(groupId: string, options?: Rev.SearchOptions<string>): SearchRequest<string>;
    /**
     * get all users in a group with full details
     * @param groupId
     * @param options
     * @returns
     */
    listUserDetails(groupId: string, options?: Rev.SearchOptions<User & {
        error?: Error;
    }>): SearchRequest<User & {
        userId: string;
        error?: Error | undefined;
    }>;
};

declare function playlistAPIFactory(rev: RevClient): {
    create(name: string, videoIds: string[]): Promise<string>;
    update(playlistId: string, actions: Playlist.UpdateAction[]): Promise<void>;
    updateFeatured(actions: Playlist.UpdateAction[]): Promise<void>;
    delete(playlistId: string): Promise<void>;
    /**
     * get list of playlists in system.
     * NOTE: return type is slightly different than API documentation
     * @see {@link https://revdocs.vbrick.com/reference#getplaylists}
     */
    list(): Promise<Playlist.List>;
};

declare function recordingAPIFactory(rev: RevClient): {
    startVideoConferenceRecording(sipAddress: string, sipPin: string, title?: string | undefined): Promise<string>;
    getVideoConferenceStatus(videoId: string): Promise<Video.StatusEnum>;
    stopVideoConferenceRecording(videoId: string): Promise<string>;
    startPresentationProfileRecording(request: Recording.PresentationProfileRequest): Promise<string>;
    getPresentationProfileStatus(recordingId: string): Promise<Recording.PresentationProfileStatus>;
    stopPresentationProfileRecording(recordingId: string): Promise<Recording.StopPresentationProfileResponse>;
};

declare type PresentationChaptersOptions = Rev.RequestOptions & UploadFileOptions & {
    contentType?: 'application/vnd.ms-powerpoint' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
};
declare type TranscriptionOptions = Rev.RequestOptions & UploadFileOptions & {
    contentType?: 'text/plain' | 'application/x-subrip';
};
declare type ChaptersOptions = Rev.RequestOptions & Omit<UploadFileOptions, 'filename' | 'contentLength'> & {
    contentType?: 'application/x-7z-compressed' | 'text/csv' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'image/gif' | 'image/jpeg' | 'application/pdf' | 'image/png' | 'application/vnd.ms-powerpoint' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation' | 'application/x-rar-compressed' | 'image/svg+xml' | 'text/plain' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'application/zip';
};
declare function uploadAPIFactory(rev: RevClient): {
    /**
     * Upload a video, and returns the resulting video ID
     */
    video(file: FileUploadType, metadata?: Video.UploadMetadata, options?: UploadFileOptions): Promise<string>;
    transcription(videoId: string, file: FileUploadType, language?: Video.Transcription.SupportedLanguages, options?: TranscriptionOptions): Promise<void>;
    supplementalFile(videoId: string, file: FileUploadType, options?: Rev.RequestOptions & UploadFileOptions): Promise<void>;
    /**
     *
     * @param videoId id of video to add chapters to
     * @param chapters list of chapters. Must have time value and one of title or imageFile
     * @param action replace = POST/replace existing with this payload
     *               append = PUT/add or edit without removing existing
     * @param options  additional upload + request options
     */
    chapters(videoId: string, chapters: Video.Chapter.Request[], action?: 'append' | 'replace', options?: ChaptersOptions): Promise<void>;
    thumbnail(videoId: string, file: FileUploadType, options?: Rev.RequestOptions & UploadFileOptions): Promise<void>;
    presentationChapters(videoId: string, file: FileUploadType, options?: PresentationChaptersOptions): Promise<void>;
};

declare function userAPIFactory(rev: RevClient): {
    /**
     * get the list of roles available in the system (with role name and id)
     */
    readonly roles: (cache?: boolean | "Force") => Promise<Role.Details[]>;
    /**
     * Create a new User in Rev
     * @param user
     * @returns the User ID of the created user
     */
    create(user: User.Request): Promise<string>;
    delete(userId: string): Promise<void>;
    /**
     * Get details about a specific user
     * @param userLookupValue default is search by userId
     * @param type            specify that userLookupValue is email or
     *                        username instead of userId
     * @returns {User}        User details
     */
    details: {
        (userId: string): Promise<User>;
        (username: string, type: 'username'): Promise<User>;
        (email: string, type: 'email'): Promise<User>;
    };
    /**
     * get user details by username
     * @deprecated - use details(username, 'username')
     */
    getByUsername(username: string): Promise<User>;
    /**
     * get user details by email address
     * @deprecated - use details(email, 'email')
     */
    getByEmail(email: string): Promise<User>;
    /**
     * Check if user exists in the system. Instead of throwing on a 401/403 error if
     * user does not exist it returns false. Returns user details if does exist,
     * instead of just true
     * @param userLookupValue userId, username, or email
     * @param type
     * @returns User if exists, otherwise false
     */
    exists(userLookupValue: string, type?: User.DetailsLookup | undefined): Promise<User | false>;
    /**
     * use PATCH API to add user to the specified group
     * https://revdocs.vbrick.com/reference#edituserdetails
     * @param {string} userId id of user in question
     * @param {string} groupId
     * @returns {Promise<void>}
     */
    addToGroup(userId: string, groupId: string): Promise<void>;
    /**
     * use PATCH API to add user to the specified group
     * https://revdocs.vbrick.com/reference#edituserdetails
     * @param {string} userId id of user in question
     * @param {string} groupId
     * @returns {Promise<void>}
     */
    removeFromGroup(userId: string, groupId: string): Promise<void>;
    /**
     * search for users based on text query. Leave blank to return all users.
     *
     * @param {string} [searchText]
     * @param {Rev.SearchOptions<{Id: string, Name: string}>} [options]
     */
    search(searchText?: string | undefined, options?: Rev.SearchOptions<User.SearchHit>): SearchRequest<User.SearchHit>;
};

declare function parseOptions(options: Video.VideoReportOptions): {
    maxResults?: number | undefined;
    onProgress?: ((items: Video.VideoReportEntry[], current: number, total?: number | undefined) => void) | undefined;
    onError?: ((err: Error | ScrollError) => void) | undefined;
    onScrollError?: ((err: ScrollError) => void) | undefined;
    startDate: Date;
    endDate: Date;
    incrementDays: number;
    sortDirection: Rev.SortDirection;
    videoIds: string | undefined;
};
declare class VideoReportRequest extends PagedRequest<Video.VideoReportEntry> {
    options: Required<ReturnType<typeof parseOptions>>;
    private _rev;
    constructor(rev: RevClient, options?: Video.VideoReportOptions);
    protected _requestPage(): Promise<{
        items: Video.VideoReportEntry[];
        done: boolean;
    }>;
    get startDate(): Date;
    set startDate(value: Date);
    get endDate(): Date;
    set endDate(value: Date);
}

declare type VideoSearchDetailedItem = Video.SearchHit & (Video.Details | {
    error?: Error;
});
declare function videoAPIFactory(rev: RevClient): {
    report: {
        (options?: Video.VideoReportOptions | undefined): VideoReportRequest;
        (videoId: string, options?: Video.VideoReportOptions | undefined): VideoReportRequest;
    };
    download: (videoId: string, options?: Rev.RequestOptions) => Promise<Rev.Response<ReadableStream<any>>>;
    downloadChapter: (chapter: Video.Chapter) => Promise<Blob>;
    downloadSupplemental: {
        (file: Video.SupplementalFile): Promise<Blob>;
        (videoId: string, fileId: string): Promise<Blob>;
    };
    downloadThumbnail: {
        (thumbnailUrl: string): Promise<Blob>;
        (query: {
            imageId: string;
        }): Promise<Blob>;
        (query: {
            videoId: string;
        }): Promise<Blob>;
    };
    downloadTranscription: {
        (transcription: Video.Transcription): Promise<Blob>;
        (videoId: string, language: string): Promise<Blob>;
    };
    /**
     * This is an example of using the video Patch API to only update a single field
     * @param videoId
     * @param title
     */
    setTitle(videoId: string, title: string): Promise<void>;
    /**
     * get processing status of a video
     * @param videoId
     */
    status(videoId: string): Promise<Video.StatusResponse>;
    details(videoId: string): Promise<Video.Details>;
    /** get list of comments on a video */
    comments(videoId: string): Promise<Video.Comment[]>;
    chapters(videoId: string): Promise<Video.Chapter[]>;
    supplementalFiles(videoId: string): Promise<Video.SupplementalFile[]>;
    transcriptions(videoId: string): Promise<Video.Transcription[]>;
    upload: (file: FileUploadType, metadata?: Video.UploadMetadata, options?: UploadFileOptions) => Promise<string>;
    migrate(videoId: string, options: Video.MigrateRequest): Promise<void>;
    /**
     * search for videos, return as one big list. leave blank to get all videos in the account
     */
    search(query?: Video.SearchOptions, options?: Rev.SearchOptions<Video.SearchHit>): Rev.ISearchRequest<Video.SearchHit>;
    /**
     * Example of using the video search API to search for videos, then getting
     * the details of each video
     * @param query
     * @param options
     */
    searchDetailed(query?: Video.SearchOptions, options?: Rev.SearchOptions<VideoSearchDetailedItem>): Rev.ISearchRequest<VideoSearchDetailedItem>;
    playbackInfo(videoId: string): Promise<Video.Playback>;
};

declare class RealtimeReportRequest<T extends Webcast.RealtimeSession = Webcast.RealtimeSession> extends SearchRequest<T> {
    summary: Webcast.RealtimeSummary;
    constructor(rev: RevClient, eventId: string, query?: Webcast.RealtimeRequest, options?: Rev.SearchOptions<T>);
    /**
     * get the aggregate statistics only, instead of actual session data.
     * @returns {Webcast.PostEventSummary}
     */
    getSummary(): Promise<Webcast.RealtimeSummary>;
}
declare class PostEventReportRequest extends SearchRequest<Webcast.PostEventSession> {
    summary: Webcast.PostEventSummary;
    constructor(rev: RevClient, query: {
        eventId: string;
        runNumber?: number;
    }, options?: Rev.SearchOptions<Webcast.PostEventSession>);
    /**
     * get the aggregate statistics only, instead of actual session data.
     * @returns {Webcast.PostEventSummary}
     */
    getSummary(): Promise<Webcast.PostEventSummary>;
}

declare type RealtimeSession<T extends Webcast.RealtimeRequest | undefined> = T extends {
    attendeeDetails: 'All';
} ? Webcast.RealtimeSessionDetail : T extends {
    attendeeDetails: 'Counts';
} ? never : Webcast.RealtimeSession;
declare function webcastAPIFactory(rev: RevClient): {
    list(options?: Webcast.ListRequest): Promise<Webcast[]>;
    search(query: Webcast.SearchRequest, options?: Rev.SearchOptions<Webcast> | undefined): SearchRequest<Webcast>;
    create(event: Webcast.CreateRequest): Promise<string>;
    details(eventId: string): Promise<Webcast.Details>;
    edit(eventId: string, event: Webcast.CreateRequest): Promise<void>;
    delete(eventId: string): Promise<void>;
    editAccess(eventId: string, entities: Webcast.EditAttendeesRequest): Promise<void>;
    attendees(eventId: string, runNumber?: number | undefined, options?: Rev.SearchOptions<Webcast.PostEventSession> | undefined): PostEventReportRequest;
    realtimeAttendees<T extends Webcast.RealtimeRequest | undefined>(eventId: string, query?: T | undefined, options?: Rev.SearchOptions<RealtimeSession<T>> | undefined): RealtimeReportRequest<RealtimeSession<T>>;
    questions(eventId: string, runNumber?: number | undefined): Promise<Webcast.Question[]>;
    pollResults(eventId: string, runNumber?: number | undefined): Promise<Webcast.PollResults[]>;
    comments(eventId: string, runNumber?: number | undefined): Promise<Webcast.Comment[]>;
    status(eventId: string): Promise<Webcast.Status>;
    playbackUrl(eventId: string, options?: Webcast.PlaybackUrlRequest): Promise<Webcast.Playback[]>;
    startEvent(eventId: string, preProduction?: boolean): Promise<void>;
    stopEvent(eventId: string, preProduction?: boolean): Promise<void>;
    startBroadcast(eventId: string): Promise<void>;
    stopBroadcast(eventId: string): Promise<void>;
    startRecord(eventId: string): Promise<void>;
    stopRecord(eventId: string): Promise<void>;
    linkVideo(eventId: string, videoId: string, autoRedirect?: boolean): Promise<any>;
    unlinkVideo(eventId: string): Promise<void>;
    /**
     * Retrieve details of a specific guest user Public webcast registration.
     * @param eventId - Id of the Public webcast
     * @param registrationId - Id of guest user's registration to retrieve
     * @returns
     */
    guestRegistration(eventId: string, registrationId: string): Promise<GuestRegistration.Details>;
    /**
     * Register one attendee/guest user for an upcoming Public webcast. Make sure you first enable Public webcast pre-registration before adding registrations.
     * @param eventId
     * @param registration
     * @returns
     */
    createGuestRegistration(eventId: string, registration: GuestRegistration.Request): Promise<GuestRegistration.Details>;
    listGuestRegistrations(eventId: string, query?: GuestRegistration.SearchRequest, options?: Rev.SearchOptions<GuestRegistration> | undefined): SearchRequest<GuestRegistration>;
    updateGuestRegistration(eventId: string, registrationId: string, registration: GuestRegistration.Request): Promise<void>;
    patchGuestRegistration(eventId: string, registrationId: string, registration: Partial<GuestRegistration.Request>): Promise<void>;
    deleteGuestRegistration(eventId: string, registrationId: string): Promise<void>;
};

declare function zonesAPIFactory(rev: RevClient): {
    list(): Promise<{
        defaultZone: Zone;
        zones: Zone[];
    }>;
    flatList(): Promise<Zone.FlatZone[]>;
    create(zone: Zone.CreateRequest): Promise<string>;
    edit(zoneId: string, zone: Zone.CreateRequest): Promise<void>;
    delete(zoneId: string): Promise<void>;
    readonly devices: () => Promise<Device.ZoneDevice[]>;
};

declare type PayloadType = {
    [key: string]: any;
} | Record<string, any> | any[];
declare class RevClient {
    url: string;
    logEnabled: boolean;
    session: Rev.IRevSession;
    readonly admin: ReturnType<typeof adminAPIFactory>;
    readonly audit: ReturnType<typeof auditAPIFactory>;
    readonly auth: ReturnType<typeof authAPIFactory>;
    readonly category: ReturnType<typeof categoryAPIFactory>;
    readonly channel: ReturnType<typeof channelAPIFactory>;
    readonly device: ReturnType<typeof deviceAPIFactory>;
    readonly group: ReturnType<typeof groupAPIFactory>;
    readonly playlist: ReturnType<typeof playlistAPIFactory>;
    readonly recording: ReturnType<typeof recordingAPIFactory>;
    readonly upload: ReturnType<typeof uploadAPIFactory>;
    readonly user: ReturnType<typeof userAPIFactory>;
    readonly video: ReturnType<typeof videoAPIFactory>;
    readonly webcast: ReturnType<typeof webcastAPIFactory>;
    readonly zones: ReturnType<typeof zonesAPIFactory>;
    constructor(options: Rev.Options);
    /**
     * make a REST request
     */
    request<T = any>(method: Rev.HTTPMethod, endpoint: string, data?: any, options?: Rev.RequestOptions): Promise<Rev.Response<T>>;
    get<T = any>(endpoint: string, data?: PayloadType, options?: Rev.RequestOptions): Promise<T>;
    post<T = any>(endpoint: string, data?: PayloadType, options?: Rev.RequestOptions): Promise<T>;
    put<T = any>(endpoint: string, data?: PayloadType, options?: Rev.RequestOptions): Promise<T>;
    patch(endpoint: string, data?: PayloadType, options?: Rev.RequestOptions): Promise<void>;
    delete(endpoint: string, data?: PayloadType, options?: Rev.RequestOptions): Promise<void>;
    /**
     * authenticate with Rev
     */
    connect(): Promise<void>;
    /**
     * end rev session
     */
    disconnect(): Promise<void>;
    extendSession(): Promise<void>;
    /**
     * Returns true/false based on if the session is currently valid
     * @returns Promise<boolean>
     */
    verifySession(): Promise<boolean>;
    get isConnected(): boolean;
    get token(): string | undefined;
    get sessionExpires(): Date;
    get sessionState(): Rev.IRevSessionState;
    set sessionState(state: Rev.IRevSessionState);
    log(severity: Rev.LogSeverity, ...args: any[]): void;
}

declare class RevError extends Error {
    status: number;
    url: string;
    code: string;
    detail: string;
    constructor(response: Response, body: {
        [key: string]: any;
    } | string);
    get name(): string;
    get [Symbol.toStringTag](): string;
    static create(response: Response): Promise<RevError>;
}
declare class ScrollError extends Error {
    status: number;
    code: string;
    detail: string;
    constructor(status?: number, code?: string, detail?: string);
    get name(): string;
    get [Symbol.toStringTag](): string;
}

interface RateLimitOptions {
    /**
     * how many to allow in parallel in any given interval
     * @default 1
     */
    limit?: number;
    /**
     * interval in milliseconds
     */
    interval?: number;
    /**
     * set limit to X per second
     */
    perSecond?: number;
    /**
     * set limit to X per minute (can be fraction, i.e. 0.5 for 1 every 2 minutes)
     */
    perMinute?: number;
    /**
     * set limit to X per hour
     */
    perHour?: number;
    /**
     * cancel with AbortController
     */
    signal?: AbortSignal;
}
declare type ThrottledFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => ReturnType<T> extends PromiseLike<infer Return> ? Promise<Return> : Promise<ReturnType<T>>) & {
    /**
    Abort pending executions. All unresolved promises are rejected with a `CancelError` error.
    */
    abort: () => void;
};
interface RateLimitOptionsWithFn<T> extends RateLimitOptions {
    /**
     * function to rate limit
     */
    fn: T;
}
declare function rateLimit<T extends (...args: any) => any>(options: RateLimitOptionsWithFn<T>): ThrottledFunction<T>;
declare function rateLimit<T extends (...args: any) => any>(fn: T, options: RateLimitOptions): ThrottledFunction<T>;
declare function rateLimit<T extends (...args: any) => any>(fn: T | RateLimitOptionsWithFn<T>, options?: RateLimitOptions): ThrottledFunction<T>;

declare const utils: {
    rateLimit: typeof rateLimit;
    getExtensionForMime: typeof getExtensionForMime;
    getMimeForExtension: typeof getMimeForExtension;
};

export { AccessControl, Admin, Audit, Auth, Category, Channel, Device, Group, GuestRegistration, OAuth, Playlist, Recording, RegistrationField, Rev, RevClient, RevError, Role, ScrollError, User, Video, Webcast, Zone, RevClient as default, utils };
