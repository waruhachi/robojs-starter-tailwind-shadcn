import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get('frame_id') != null;
let discordSdk;
if (isEmbedded) {
    discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
} else {
    // We're using session storage for user_id, guild_id, and channel_id
    // This way the user/guild/channel will be maintained until the tab is closed, even if you refresh
    // Session storage will generate new unique mocks for each tab you open
    // Any of these values can be overridden via query parameters
    // i.e. if you set https://my-tunnel-url.com/?user_id=test_user_id
    // this will override this will override the session user_id value
    const mockUserId = getOverrideOrRandomSessionValue('user_id');
    const mockGuildId = getOverrideOrRandomSessionValue('guild_id');
    const mockChannelId = getOverrideOrRandomSessionValue('channel_id');
    discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, mockGuildId, mockChannelId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);
    discordSdk._updateCommandMocks({
        authenticate: async ()=>{
            return {
                access_token: 'mock_token',
                user: {
                    username: mockUserId,
                    discriminator,
                    id: mockUserId,
                    avatar: null,
                    public_flags: 1
                },
                scopes: [],
                expires: new Date(2112, 1, 1).toString(),
                application: {
                    description: 'mock_app_description',
                    icon: 'mock_app_icon',
                    id: 'mock_app_id',
                    name: 'mock_app_name'
                }
            };
        }
    });
}
export { discordSdk };
var SessionStorageQueryParam;
(function(SessionStorageQueryParam) {
    SessionStorageQueryParam["user_id"] = "user_id";
    SessionStorageQueryParam["guild_id"] = "guild_id";
    SessionStorageQueryParam["channel_id"] = "channel_id";
})(SessionStorageQueryParam || (SessionStorageQueryParam = {}));
function getOverrideOrRandomSessionValue(queryParam) {
    const overrideValue = queryParams.get(queryParam);
    if (overrideValue != null) {
        return overrideValue;
    }
    const currentStoredValue = sessionStorage.getItem(queryParam);
    if (currentStoredValue != null) {
        return currentStoredValue;
    }
    // Set queryParam to a random 8-character string
    const randomString = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(queryParam, randomString);
    return randomString;
}
const DiscordContext = /*#__PURE__*/ createContext({
    accessToken: null,
    authenticated: false,
    discordSdk: discordSdk,
    error: null,
    session: {
        user: {
            id: '',
            username: '',
            discriminator: '',
            avatar: null,
            public_flags: 0
        },
        access_token: '',
        scopes: [],
        expires: '',
        application: {
            rpc_origins: undefined,
            id: '',
            name: '',
            icon: null,
            description: ''
        }
    },
    status: 'pending'
});
export function DiscordContextProvider(props) {
    const { authenticate, children, loadingScreen = null, scope } = props;
    const setupResult = useDiscordSdkSetup({
        authenticate,
        scope
    });
    if (loadingScreen && ![
        'error',
        'ready'
    ].includes(setupResult.status)) {
        return /*#__PURE__*/ React.createElement(React.Fragment, null, loadingScreen);
    }
    return /*#__PURE__*/ React.createElement(DiscordContext.Provider, {
        value: setupResult
    }, children);
}
export function useDiscordSdk() {
    return useContext(DiscordContext);
}
/**
 * Authenticate with Discord and return the access token.
 * See full list of scopes: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 *
 * @param scope The scope of the authorization (default: ['identify', 'guilds'])
 * @returns The result of the Discord SDK `authenticate()` command
 */ export async function authenticateSdk(options) {
    const { scope = [
        'identify',
        'guilds'
    ] } = options ?? {};
    await discordSdk.ready();
    const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: scope
    });
    const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code
        })
    });
    const { access_token } = await response.json();
    // Authenticate with Discord client (using the access_token)
    const auth = await discordSdk.commands.authenticate({
        access_token
    });
    if (auth == null) {
        throw new Error('Authenticate command failed');
    }
    return {
        accessToken: access_token,
        auth
    };
}
export function useDiscordSdkSetup(options) {
    const { authenticate, scope } = options ?? {};
    const [accessToken, setAccessToken] = useState(null);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('pending');
    const setupDiscordSdk = useCallback(async ()=>{
        try {
            setStatus('loading');
            await discordSdk.ready();
            if (authenticate) {
                setStatus('authenticating');
                const { accessToken, auth } = await authenticateSdk({
                    scope
                });
                setAccessToken(accessToken);
                setSession(auth);
            }
            setStatus('ready');
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred');
            }
            setStatus('error');
        }
    }, [
        authenticate
    ]);
    useStableEffect(()=>{
        setupDiscordSdk();
    });
    return {
        accessToken,
        authenticated: !!accessToken,
        discordSdk,
        error,
        session,
        status
    };
}
/**
 * React in development mode re-mounts the root component initially.
 * This hook ensures that the callback is only called once, preventing double authentication.
 */ function useStableEffect(callback) {
    const isRunning = useRef(false);
    useEffect(()=>{
        if (!isRunning.current) {
            isRunning.current = true;
            callback();
        }
    }, []);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJ1aGEvRG93bmxvYWRzL3N0YXJ0ZXItcmVhY3QtdHMtdGFpbHdpbmQvc3JjL2hvb2tzL3VzZURpc2NvcmRTZGsudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpc2NvcmRTREssIERpc2NvcmRTREtNb2NrIH0gZnJvbSAnQGRpc2NvcmQvZW1iZWRkZWQtYXBwLXNkaydcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VSZWYsIGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5cbnR5cGUgVW53cmFwUHJvbWlzZTxUPiA9IFQgZXh0ZW5kcyBQcm9taXNlPGluZmVyIFU+ID8gVSA6IFRcbnR5cGUgRGlzY29yZFNlc3Npb24gPSBVbndyYXBQcm9taXNlPFJldHVyblR5cGU8dHlwZW9mIGRpc2NvcmRTZGsuY29tbWFuZHMuYXV0aGVudGljYXRlPj5cbnR5cGUgQXV0aG9yaXplSW5wdXQgPSBQYXJhbWV0ZXJzPHR5cGVvZiBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhvcml6ZT5bMF1cbnR5cGUgU2RrU2V0dXBSZXN1bHQgPSBSZXR1cm5UeXBlPHR5cGVvZiB1c2VEaXNjb3JkU2RrU2V0dXA+XG5cbmNvbnN0IHF1ZXJ5UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKVxuY29uc3QgaXNFbWJlZGRlZCA9IHF1ZXJ5UGFyYW1zLmdldCgnZnJhbWVfaWQnKSAhPSBudWxsXG5cbmxldCBkaXNjb3JkU2RrOiBEaXNjb3JkU0RLIHwgRGlzY29yZFNES01vY2tcblxuaWYgKGlzRW1iZWRkZWQpIHtcblx0ZGlzY29yZFNkayA9IG5ldyBEaXNjb3JkU0RLKGltcG9ydC5tZXRhLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lEKVxufSBlbHNlIHtcblx0Ly8gV2UncmUgdXNpbmcgc2Vzc2lvbiBzdG9yYWdlIGZvciB1c2VyX2lkLCBndWlsZF9pZCwgYW5kIGNoYW5uZWxfaWRcblx0Ly8gVGhpcyB3YXkgdGhlIHVzZXIvZ3VpbGQvY2hhbm5lbCB3aWxsIGJlIG1haW50YWluZWQgdW50aWwgdGhlIHRhYiBpcyBjbG9zZWQsIGV2ZW4gaWYgeW91IHJlZnJlc2hcblx0Ly8gU2Vzc2lvbiBzdG9yYWdlIHdpbGwgZ2VuZXJhdGUgbmV3IHVuaXF1ZSBtb2NrcyBmb3IgZWFjaCB0YWIgeW91IG9wZW5cblx0Ly8gQW55IG9mIHRoZXNlIHZhbHVlcyBjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgcXVlcnkgcGFyYW1ldGVyc1xuXHQvLyBpLmUuIGlmIHlvdSBzZXQgaHR0cHM6Ly9teS10dW5uZWwtdXJsLmNvbS8/dXNlcl9pZD10ZXN0X3VzZXJfaWRcblx0Ly8gdGhpcyB3aWxsIG92ZXJyaWRlIHRoaXMgd2lsbCBvdmVycmlkZSB0aGUgc2Vzc2lvbiB1c2VyX2lkIHZhbHVlXG5cdGNvbnN0IG1vY2tVc2VySWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCd1c2VyX2lkJylcblx0Y29uc3QgbW9ja0d1aWxkSWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCdndWlsZF9pZCcpXG5cdGNvbnN0IG1vY2tDaGFubmVsSWQgPSBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKCdjaGFubmVsX2lkJylcblxuXHRkaXNjb3JkU2RrID0gbmV3IERpc2NvcmRTREtNb2NrKGltcG9ydC5tZXRhLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lELCBtb2NrR3VpbGRJZCwgbW9ja0NoYW5uZWxJZClcblx0Y29uc3QgZGlzY3JpbWluYXRvciA9IFN0cmluZyhtb2NrVXNlcklkLmNoYXJDb2RlQXQoMCkgJSA1KVxuXG5cdGRpc2NvcmRTZGsuX3VwZGF0ZUNvbW1hbmRNb2Nrcyh7XG5cdFx0YXV0aGVudGljYXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhY2Nlc3NfdG9rZW46ICdtb2NrX3Rva2VuJyxcblx0XHRcdFx0dXNlcjoge1xuXHRcdFx0XHRcdHVzZXJuYW1lOiBtb2NrVXNlcklkLFxuXHRcdFx0XHRcdGRpc2NyaW1pbmF0b3IsXG5cdFx0XHRcdFx0aWQ6IG1vY2tVc2VySWQsXG5cdFx0XHRcdFx0YXZhdGFyOiBudWxsLFxuXHRcdFx0XHRcdHB1YmxpY19mbGFnczogMVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzY29wZXM6IFtdLFxuXHRcdFx0XHRleHBpcmVzOiBuZXcgRGF0ZSgyMTEyLCAxLCAxKS50b1N0cmluZygpLFxuXHRcdFx0XHRhcHBsaWNhdGlvbjoge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiAnbW9ja19hcHBfZGVzY3JpcHRpb24nLFxuXHRcdFx0XHRcdGljb246ICdtb2NrX2FwcF9pY29uJyxcblx0XHRcdFx0XHRpZDogJ21vY2tfYXBwX2lkJyxcblx0XHRcdFx0XHRuYW1lOiAnbW9ja19hcHBfbmFtZSdcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSlcbn1cblxuZXhwb3J0IHsgZGlzY29yZFNkayB9XG5cbmVudW0gU2Vzc2lvblN0b3JhZ2VRdWVyeVBhcmFtIHtcblx0dXNlcl9pZCA9ICd1c2VyX2lkJyxcblx0Z3VpbGRfaWQgPSAnZ3VpbGRfaWQnLFxuXHRjaGFubmVsX2lkID0gJ2NoYW5uZWxfaWQnXG59XG5cbmZ1bmN0aW9uIGdldE92ZXJyaWRlT3JSYW5kb21TZXNzaW9uVmFsdWUocXVlcnlQYXJhbTogYCR7U2Vzc2lvblN0b3JhZ2VRdWVyeVBhcmFtfWApIHtcblx0Y29uc3Qgb3ZlcnJpZGVWYWx1ZSA9IHF1ZXJ5UGFyYW1zLmdldChxdWVyeVBhcmFtKVxuXHRpZiAob3ZlcnJpZGVWYWx1ZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIG92ZXJyaWRlVmFsdWVcblx0fVxuXG5cdGNvbnN0IGN1cnJlbnRTdG9yZWRWYWx1ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0ocXVlcnlQYXJhbSlcblx0aWYgKGN1cnJlbnRTdG9yZWRWYWx1ZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIGN1cnJlbnRTdG9yZWRWYWx1ZVxuXHR9XG5cblx0Ly8gU2V0IHF1ZXJ5UGFyYW0gdG8gYSByYW5kb20gOC1jaGFyYWN0ZXIgc3RyaW5nXG5cdGNvbnN0IHJhbmRvbVN0cmluZyA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDEwKVxuXHRzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKHF1ZXJ5UGFyYW0sIHJhbmRvbVN0cmluZylcblx0cmV0dXJuIHJhbmRvbVN0cmluZ1xufVxuXG5jb25zdCBEaXNjb3JkQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8U2RrU2V0dXBSZXN1bHQ+KHtcblx0YWNjZXNzVG9rZW46IG51bGwsXG5cdGF1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxuXHRkaXNjb3JkU2RrOiBkaXNjb3JkU2RrLFxuXHRlcnJvcjogbnVsbCxcblx0c2Vzc2lvbjoge1xuXHRcdHVzZXI6IHtcblx0XHRcdGlkOiAnJyxcblx0XHRcdHVzZXJuYW1lOiAnJyxcblx0XHRcdGRpc2NyaW1pbmF0b3I6ICcnLFxuXHRcdFx0YXZhdGFyOiBudWxsLFxuXHRcdFx0cHVibGljX2ZsYWdzOiAwXG5cdFx0fSxcblx0XHRhY2Nlc3NfdG9rZW46ICcnLFxuXHRcdHNjb3BlczogW10sXG5cdFx0ZXhwaXJlczogJycsXG5cdFx0YXBwbGljYXRpb246IHtcblx0XHRcdHJwY19vcmlnaW5zOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogJycsXG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdGljb246IG51bGwsXG5cdFx0XHRkZXNjcmlwdGlvbjogJydcblx0XHR9XG5cdH0sXG5cdHN0YXR1czogJ3BlbmRpbmcnXG59KVxuXG5pbnRlcmZhY2UgRGlzY29yZENvbnRleHRQcm92aWRlclByb3BzIHtcblx0YXV0aGVudGljYXRlPzogYm9vbGVhblxuXHRjaGlsZHJlbjogUmVhY3ROb2RlXG5cdGxvYWRpbmdTY3JlZW4/OiBSZWFjdE5vZGVcblx0c2NvcGU/OiBBdXRob3JpemVJbnB1dFsnc2NvcGUnXVxufVxuZXhwb3J0IGZ1bmN0aW9uIERpc2NvcmRDb250ZXh0UHJvdmlkZXIocHJvcHM6IERpc2NvcmRDb250ZXh0UHJvdmlkZXJQcm9wcykge1xuXHRjb25zdCB7IGF1dGhlbnRpY2F0ZSwgY2hpbGRyZW4sIGxvYWRpbmdTY3JlZW4gPSBudWxsLCBzY29wZSB9ID0gcHJvcHNcblx0Y29uc3Qgc2V0dXBSZXN1bHQgPSB1c2VEaXNjb3JkU2RrU2V0dXAoeyBhdXRoZW50aWNhdGUsIHNjb3BlIH0pXG5cblx0aWYgKGxvYWRpbmdTY3JlZW4gJiYgIVsnZXJyb3InLCAncmVhZHknXS5pbmNsdWRlcyhzZXR1cFJlc3VsdC5zdGF0dXMpKSB7XG5cdFx0cmV0dXJuIDw+e2xvYWRpbmdTY3JlZW59PC8+XG5cdH1cblxuXHRyZXR1cm4gPERpc2NvcmRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzZXR1cFJlc3VsdH0+e2NoaWxkcmVufTwvRGlzY29yZENvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEaXNjb3JkU2RrKCkge1xuXHRyZXR1cm4gdXNlQ29udGV4dChEaXNjb3JkQ29udGV4dClcbn1cblxuaW50ZXJmYWNlIEF1dGhlbnRpY2F0ZVNka09wdGlvbnMge1xuXHRzY29wZT86IEF1dGhvcml6ZUlucHV0WydzY29wZSddXG59XG5cbi8qKlxuICogQXV0aGVudGljYXRlIHdpdGggRGlzY29yZCBhbmQgcmV0dXJuIHRoZSBhY2Nlc3MgdG9rZW4uXG4gKiBTZWUgZnVsbCBsaXN0IG9mIHNjb3BlczogaHR0cHM6Ly9kaXNjb3JkLmNvbS9kZXZlbG9wZXJzL2RvY3MvdG9waWNzL29hdXRoMiNzaGFyZWQtcmVzb3VyY2VzLW9hdXRoMi1zY29wZXNcbiAqXG4gKiBAcGFyYW0gc2NvcGUgVGhlIHNjb3BlIG9mIHRoZSBhdXRob3JpemF0aW9uIChkZWZhdWx0OiBbJ2lkZW50aWZ5JywgJ2d1aWxkcyddKVxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgRGlzY29yZCBTREsgYGF1dGhlbnRpY2F0ZSgpYCBjb21tYW5kXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdXRoZW50aWNhdGVTZGsob3B0aW9ucz86IEF1dGhlbnRpY2F0ZVNka09wdGlvbnMpIHtcblx0Y29uc3QgeyBzY29wZSA9IFsnaWRlbnRpZnknLCAnZ3VpbGRzJ10gfSA9IG9wdGlvbnMgPz8ge31cblxuXHRhd2FpdCBkaXNjb3JkU2RrLnJlYWR5KClcblx0Y29uc3QgeyBjb2RlIH0gPSBhd2FpdCBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhvcml6ZSh7XG5cdFx0Y2xpZW50X2lkOiBpbXBvcnQubWV0YS5lbnYuVklURV9ESVNDT1JEX0NMSUVOVF9JRCxcblx0XHRyZXNwb25zZV90eXBlOiAnY29kZScsXG5cdFx0c3RhdGU6ICcnLFxuXHRcdHByb21wdDogJ25vbmUnLFxuXHRcdHNjb3BlOiBzY29wZVxuXHR9KVxuXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9hcGkvdG9rZW4nLCB7XG5cdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0aGVhZGVyczoge1xuXHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuXHRcdH0sXG5cdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoeyBjb2RlIH0pXG5cdH0pXG5cdGNvbnN0IHsgYWNjZXNzX3Rva2VuIH0gPSBhd2FpdCByZXNwb25zZS5qc29uKClcblxuXHQvLyBBdXRoZW50aWNhdGUgd2l0aCBEaXNjb3JkIGNsaWVudCAodXNpbmcgdGhlIGFjY2Vzc190b2tlbilcblx0Y29uc3QgYXV0aCA9IGF3YWl0IGRpc2NvcmRTZGsuY29tbWFuZHMuYXV0aGVudGljYXRlKHsgYWNjZXNzX3Rva2VuIH0pXG5cblx0aWYgKGF1dGggPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQXV0aGVudGljYXRlIGNvbW1hbmQgZmFpbGVkJylcblx0fVxuXHRyZXR1cm4geyBhY2Nlc3NUb2tlbjogYWNjZXNzX3Rva2VuLCBhdXRoIH1cbn1cblxuaW50ZXJmYWNlIFVzZURpc2NvcmRTZGtTZXR1cE9wdGlvbnMge1xuXHRhdXRoZW50aWNhdGU/OiBib29sZWFuXG5cdHNjb3BlPzogQXV0aG9yaXplSW5wdXRbJ3Njb3BlJ11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURpc2NvcmRTZGtTZXR1cChvcHRpb25zPzogVXNlRGlzY29yZFNka1NldHVwT3B0aW9ucykge1xuXHRjb25zdCB7IGF1dGhlbnRpY2F0ZSwgc2NvcGUgfSA9IG9wdGlvbnMgPz8ge31cblx0Y29uc3QgW2FjY2Vzc1Rva2VuLCBzZXRBY2Nlc3NUb2tlbl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuXHRjb25zdCBbc2Vzc2lvbiwgc2V0U2Vzc2lvbl0gPSB1c2VTdGF0ZTxEaXNjb3JkU2Vzc2lvbiB8IG51bGw+KG51bGwpXG5cdGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcblx0Y29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPCdhdXRoZW50aWNhdGluZycgfCAnZXJyb3InIHwgJ2xvYWRpbmcnIHwgJ3BlbmRpbmcnIHwgJ3JlYWR5Jz4oJ3BlbmRpbmcnKVxuXG5cdGNvbnN0IHNldHVwRGlzY29yZFNkayA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcblx0XHR0cnkge1xuXHRcdFx0c2V0U3RhdHVzKCdsb2FkaW5nJylcblx0XHRcdGF3YWl0IGRpc2NvcmRTZGsucmVhZHkoKVxuXG5cdFx0XHRpZiAoYXV0aGVudGljYXRlKSB7XG5cdFx0XHRcdHNldFN0YXR1cygnYXV0aGVudGljYXRpbmcnKVxuXHRcdFx0XHRjb25zdCB7IGFjY2Vzc1Rva2VuLCBhdXRoIH0gPSBhd2FpdCBhdXRoZW50aWNhdGVTZGsoeyBzY29wZSB9KVxuXHRcdFx0XHRzZXRBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbilcblx0XHRcdFx0c2V0U2Vzc2lvbihhdXRoKVxuXHRcdFx0fVxuXG5cdFx0XHRzZXRTdGF0dXMoJ3JlYWR5Jylcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XG5cdFx0XHRcdHNldEVycm9yKGUubWVzc2FnZSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNldEVycm9yKCdBbiB1bmtub3duIGVycm9yIG9jY3VycmVkJylcblx0XHRcdH1cblx0XHRcdHNldFN0YXR1cygnZXJyb3InKVxuXHRcdH1cblx0fSwgW2F1dGhlbnRpY2F0ZV0pXG5cblx0dXNlU3RhYmxlRWZmZWN0KCgpID0+IHtcblx0XHRzZXR1cERpc2NvcmRTZGsoKVxuXHR9KVxuXG5cdHJldHVybiB7IGFjY2Vzc1Rva2VuLCBhdXRoZW50aWNhdGVkOiAhIWFjY2Vzc1Rva2VuLCBkaXNjb3JkU2RrLCBlcnJvciwgc2Vzc2lvbiwgc3RhdHVzIH1cbn1cblxuLyoqXG4gKiBSZWFjdCBpbiBkZXZlbG9wbWVudCBtb2RlIHJlLW1vdW50cyB0aGUgcm9vdCBjb21wb25lbnQgaW5pdGlhbGx5LlxuICogVGhpcyBob29rIGVuc3VyZXMgdGhhdCB0aGUgY2FsbGJhY2sgaXMgb25seSBjYWxsZWQgb25jZSwgcHJldmVudGluZyBkb3VibGUgYXV0aGVudGljYXRpb24uXG4gKi9cbmZ1bmN0aW9uIHVzZVN0YWJsZUVmZmVjdChjYWxsYmFjazogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4pIHtcblx0Y29uc3QgaXNSdW5uaW5nID0gdXNlUmVmKGZhbHNlKVxuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0aWYgKCFpc1J1bm5pbmcuY3VycmVudCkge1xuXHRcdFx0aXNSdW5uaW5nLmN1cnJlbnQgPSB0cnVlXG5cdFx0XHRjYWxsYmFjaygpXG5cdFx0fVxuXHR9LCBbXSlcbn1cbiJdLCJuYW1lcyI6WyJEaXNjb3JkU0RLIiwiRGlzY29yZFNES01vY2siLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZUNhbGxiYWNrIiwidXNlUmVmIiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJxdWVyeVBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiaXNFbWJlZGRlZCIsImdldCIsImRpc2NvcmRTZGsiLCJlbnYiLCJWSVRFX0RJU0NPUkRfQ0xJRU5UX0lEIiwibW9ja1VzZXJJZCIsImdldE92ZXJyaWRlT3JSYW5kb21TZXNzaW9uVmFsdWUiLCJtb2NrR3VpbGRJZCIsIm1vY2tDaGFubmVsSWQiLCJkaXNjcmltaW5hdG9yIiwiU3RyaW5nIiwiY2hhckNvZGVBdCIsIl91cGRhdGVDb21tYW5kTW9ja3MiLCJhdXRoZW50aWNhdGUiLCJhY2Nlc3NfdG9rZW4iLCJ1c2VyIiwidXNlcm5hbWUiLCJpZCIsImF2YXRhciIsInB1YmxpY19mbGFncyIsInNjb3BlcyIsImV4cGlyZXMiLCJEYXRlIiwidG9TdHJpbmciLCJhcHBsaWNhdGlvbiIsImRlc2NyaXB0aW9uIiwiaWNvbiIsIm5hbWUiLCJTZXNzaW9uU3RvcmFnZVF1ZXJ5UGFyYW0iLCJxdWVyeVBhcmFtIiwib3ZlcnJpZGVWYWx1ZSIsImN1cnJlbnRTdG9yZWRWYWx1ZSIsInNlc3Npb25TdG9yYWdlIiwiZ2V0SXRlbSIsInJhbmRvbVN0cmluZyIsIk1hdGgiLCJyYW5kb20iLCJzbGljZSIsInNldEl0ZW0iLCJEaXNjb3JkQ29udGV4dCIsImFjY2Vzc1Rva2VuIiwiYXV0aGVudGljYXRlZCIsImVycm9yIiwic2Vzc2lvbiIsInJwY19vcmlnaW5zIiwidW5kZWZpbmVkIiwic3RhdHVzIiwiRGlzY29yZENvbnRleHRQcm92aWRlciIsInByb3BzIiwiY2hpbGRyZW4iLCJsb2FkaW5nU2NyZWVuIiwic2NvcGUiLCJzZXR1cFJlc3VsdCIsInVzZURpc2NvcmRTZGtTZXR1cCIsImluY2x1ZGVzIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZURpc2NvcmRTZGsiLCJhdXRoZW50aWNhdGVTZGsiLCJvcHRpb25zIiwicmVhZHkiLCJjb2RlIiwiY29tbWFuZHMiLCJhdXRob3JpemUiLCJjbGllbnRfaWQiLCJyZXNwb25zZV90eXBlIiwic3RhdGUiLCJwcm9tcHQiLCJyZXNwb25zZSIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbiIsImF1dGgiLCJFcnJvciIsInNldEFjY2Vzc1Rva2VuIiwic2V0U2Vzc2lvbiIsInNldEVycm9yIiwic2V0U3RhdHVzIiwic2V0dXBEaXNjb3JkU2RrIiwiZSIsImNvbnNvbGUiLCJtZXNzYWdlIiwidXNlU3RhYmxlRWZmZWN0IiwiY2FsbGJhY2siLCJpc1J1bm5pbmciLCJjdXJyZW50Il0sInJhbmdlTWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLEVBQUVDLGNBQWMsUUFBUSw0QkFBMkI7QUFDdEUsU0FBU0MsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsUUFBUSxRQUFPO0FBUTNGLE1BQU1DLGNBQWMsSUFBSUMsZ0JBQWdCQyxPQUFPQyxRQUFRLENBQUNDLE1BQU07QUFDOUQsTUFBTUMsYUFBYUwsWUFBWU0sR0FBRyxDQUFDLGVBQWU7QUFFbEQsSUFBSUM7QUFFSixJQUFJRixZQUFZO0lBQ2ZFLGFBQWEsSUFBSWYsV0FBVyxZQUFZZ0IsR0FBRyxDQUFDQyxzQkFBc0I7QUFDbkUsT0FBTztJQUNOLG9FQUFvRTtJQUNwRSxrR0FBa0c7SUFDbEcsdUVBQXVFO0lBQ3ZFLDZEQUE2RDtJQUM3RCxrRUFBa0U7SUFDbEUs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