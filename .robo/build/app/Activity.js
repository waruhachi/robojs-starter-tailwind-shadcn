import { useEffect, useState } from "react";
import { useDiscordSdk } from "../hooks/useDiscordSdk.js";
export const Activity = ()=>{
    const { authenticated, discordSdk, status } = useDiscordSdk();
    const [channelName, setChannelName] = useState();
    useEffect(()=>{
        // Requesting the channel in GDMs (when the guild ID is null) requires
        // the dm_channels.read scope which requires Discord approval.
        if (!authenticated || !discordSdk.channelId || !discordSdk.guildId) {
            return;
        }
        // Collect channel info over RPC
        // Enable authentication to see it! (App.tsx)
        discordSdk.commands.getChannel({
            channel_id: discordSdk.channelId
        }).then((channel)=>{
            if (channel.name) {
                setChannelName(channel.name);
            }
        });
    }, [
        authenticated,
        discordSdk
    ]);
    return /*#__PURE__*/ React.createElement("div", {
        className: "m-0 flex min-h-screen min-w-80 flex-col place-items-center"
    }, /*#__PURE__*/ React.createElement("img", {
        src: "/rocket.png",
        className: "transition-filter h-24 p-6 duration-300 hover:drop-shadow-[0_0_2em_#646cff]",
        alt: "Discord"
    }), /*#__PURE__*/ React.createElement("h1", {
        className: "my-4 text-5xl font-bold"
    }, "Hello, World"), /*#__PURE__*/ React.createElement("h3", {
        className: "my-4 font-bold"
    }, channelName ? `#${channelName}` : status), /*#__PURE__*/ React.createElement("small", {
        className: "my-4"
    }, "Powered by ", /*#__PURE__*/ React.createElement("strong", null, "Robo.js")));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJ1aGEvRG93bmxvYWRzL3N0YXJ0ZXItcmVhY3QtdHMtdGFpbHdpbmQvc3JjL2FwcC9BY3Rpdml0eS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRGlzY29yZFNkayB9IGZyb20gJy4uL2hvb2tzL3VzZURpc2NvcmRTZGsnXG5cbmV4cG9ydCBjb25zdCBBY3Rpdml0eSA9ICgpID0+IHtcblx0Y29uc3QgeyBhdXRoZW50aWNhdGVkLCBkaXNjb3JkU2RrLCBzdGF0dXMgfSA9IHVzZURpc2NvcmRTZGsoKVxuXHRjb25zdCBbY2hhbm5lbE5hbWUsIHNldENoYW5uZWxOYW1lXSA9IHVzZVN0YXRlPHN0cmluZz4oKVxuXG5cdHVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0Ly8gUmVxdWVzdGluZyB0aGUgY2hhbm5lbCBpbiBHRE1zICh3aGVuIHRoZSBndWlsZCBJRCBpcyBudWxsKSByZXF1aXJlc1xuXHRcdC8vIHRoZSBkbV9jaGFubmVscy5yZWFkIHNjb3BlIHdoaWNoIHJlcXVpcmVzIERpc2NvcmQgYXBwcm92YWwuXG5cdFx0aWYgKCFhdXRoZW50aWNhdGVkIHx8ICFkaXNjb3JkU2RrLmNoYW5uZWxJZCB8fCAhZGlzY29yZFNkay5ndWlsZElkKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHQvLyBDb2xsZWN0IGNoYW5uZWwgaW5mbyBvdmVyIFJQQ1xuXHRcdC8vIEVuYWJsZSBhdXRoZW50aWNhdGlvbiB0byBzZWUgaXQhIChBcHAudHN4KVxuXHRcdGRpc2NvcmRTZGsuY29tbWFuZHMuZ2V0Q2hhbm5lbCh7IGNoYW5uZWxfaWQ6IGRpc2NvcmRTZGsuY2hhbm5lbElkIH0pLnRoZW4oKGNoYW5uZWwpID0+IHtcblx0XHRcdGlmIChjaGFubmVsLm5hbWUpIHtcblx0XHRcdFx0c2V0Q2hhbm5lbE5hbWUoY2hhbm5lbC5uYW1lKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH0sIFthdXRoZW50aWNhdGVkLCBkaXNjb3JkU2RrXSlcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwibS0wIGZsZXggbWluLWgtc2NyZWVuIG1pbi13LTgwIGZsZXgtY29sIHBsYWNlLWl0ZW1zLWNlbnRlclwiPlxuXHRcdFx0PGltZ1xuXHRcdFx0XHRzcmM9XCIvcm9ja2V0LnBuZ1wiXG5cdFx0XHRcdGNsYXNzTmFtZT1cInRyYW5zaXRpb24tZmlsdGVyIGgtMjQgcC02IGR1cmF0aW9uLTMwMCBob3Zlcjpkcm9wLXNoYWRvdy1bMF8wXzJlbV8jNjQ2Y2ZmXVwiXG5cdFx0XHRcdGFsdD1cIkRpc2NvcmRcIlxuXHRcdFx0Lz5cblx0XHRcdDxoMSBjbGFzc05hbWU9XCJteS00IHRleHQtNXhsIGZvbnQtYm9sZFwiPkhlbGxvLCBXb3JsZDwvaDE+XG5cdFx0XHQ8aDMgY2xhc3NOYW1lPVwibXktNCBmb250LWJvbGRcIj57Y2hhbm5lbE5hbWUgPyBgIyR7Y2hhbm5lbE5hbWV9YCA6IHN0YXR1c308L2gzPlxuXHRcdFx0PHNtYWxsIGNsYXNzTmFtZT1cIm15LTRcIj5cblx0XHRcdFx0UG93ZXJlZCBieSA8c3Ryb25nPlJvYm8uanM8L3N0cm9uZz5cblx0XHRcdDwvc21hbGw+XG5cdFx0PC9kaXY+XG5cdClcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInVzZURpc2NvcmRTZGsiLCJBY3Rpdml0eSIsImF1dGhlbnRpY2F0ZWQiLCJkaXNjb3JkU2RrIiwic3RhdHVzIiwiY2hhbm5lbE5hbWUiLCJzZXRDaGFubmVsTmFtZSIsImNoYW5uZWxJZCIsImd1aWxkSWQiLCJjb21tYW5kcyIsImdldENoYW5uZWwiLCJjaGFubmVsX2lkIiwidGhlbiIsImNoYW5uZWwiLCJuYW1lIiwiZGl2IiwiY2xhc3NOYW1lIiwiaW1nIiwic3JjIiwiYWx0IiwiaDEiLCJoMyIsInNtYWxsIiwic3Ryb25nIl0sInJhbmdlTWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7IiwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFNBQVMsRUFBRUMsUUFBUSxRQUFRLFFBQU87QUFDM0MsU0FBU0MsYUFBYSxRQUFRLDRCQUF3QjtBQUV0RCxPQUFPLE1BQU1DLFdBQVc7SUFDdkIsTUFBTSxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFFLEdBQUdKO0lBQzlDLE1BQU0sQ0FBQ0ssYUFBYUMsZUFBZSxHQUFHUDtJQUV0Q0QsVUFBVTtRQUNULHNFQUFzRTtRQUN0RSw4REFBOEQ7UUFDOUQsSUFBSSxDQUFDSSxpQkFBaUIsQ0FBQ0MsV0FBV0ksU0FBUyxJQUFJLENBQUNKLFdBQVdLLE9BQU8sRUFBRTtZQUNuRTtRQUNEO1FBRUEsZ0NBQWdDO1FBQ2hDLDZDQUE2QztRQUM3Q0wsV0FBV00sUUFBUSxDQUFDQyxVQUFVLENBQUM7WUFBRUMsWUFBWVIsV0FBV0ksU0FBUztRQUFDLEdBQUdLLElBQUksQ0FBQyxDQUFDQztZQUMxRSxJQUFJQSxRQUFRQyxJQUFJLEVBQUU7Z0JBQ2pCUixlQUFlTyxRQUFRQyxJQUFJO1lBQzVCO1FBQ0Q7SUFDRCxHQUFHO1FBQUNaO1FBQWVDO0tBQVc7SUFFOUIscUJBQ0Msb0JBQUNZO1FBQUlDLFdBQVU7cUJBQ2Qsb0JBQUNDO1FBQ0FDLEtBQUk7UUFDSkYsV0FBVTtRQUNWRyxLQUFJO3NCQUVMLG9CQUFDQztRQUFHSixXQUFVO09BQTBCLCtCQUN4QyxvQkFBQ0s7UUFBR0wsV0FBVTtPQUFrQlgsY0FBYyxDQUFDLENBQUMsRUFBRUEsWUFBWSxDQUFDLEdBQUdELHVCQUNsRSxvQkFBQ2tCO1FBQU1OLFdBQVU7T0FBTyw2QkFDWixvQkFBQ08sZ0JBQU87QUFJdkIsRUFBQyJ9