export default (async (req)=>{
    const { code } = await req.json();
    // Exchange the code for an access_token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code
        })
    });
    const { access_token } = await response.json();
    return {
        access_token
    };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJ1aGEvRG93bmxvYWRzL3N0YXJ0ZXItcmVhY3QtdHMtdGFpbHdpbmQvc3JjL2FwaS90b2tlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJvYm9SZXF1ZXN0IH0gZnJvbSAnQHJvYm9qcy9zZXJ2ZXInXG5cbmludGVyZmFjZSBSZXF1ZXN0Qm9keSB7XG5cdGNvZGU6IHN0cmluZ1xufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxOiBSb2JvUmVxdWVzdCkgPT4ge1xuXHRjb25zdCB7IGNvZGUgfSA9IChhd2FpdCByZXEuanNvbigpKSBhcyBSZXF1ZXN0Qm9keVxuXG5cdC8vIEV4Y2hhbmdlIHRoZSBjb2RlIGZvciBhbiBhY2Nlc3NfdG9rZW5cblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvb2F1dGgyL3Rva2VuYCwge1xuXHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdGhlYWRlcnM6IHtcblx0XHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuXHRcdH0sXG5cdFx0Ym9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG5cdFx0XHRjbGllbnRfaWQ6IHByb2Nlc3MuZW52LlZJVEVfRElTQ09SRF9DTElFTlRfSUQhLFxuXHRcdFx0Y2xpZW50X3NlY3JldDogcHJvY2Vzcy5lbnYuRElTQ09SRF9DTElFTlRfU0VDUkVUISxcblx0XHRcdGdyYW50X3R5cGU6ICdhdXRob3JpemF0aW9uX2NvZGUnLFxuXHRcdFx0Y29kZTogY29kZVxuXHRcdH0pXG5cdH0pXG5cdGNvbnN0IHsgYWNjZXNzX3Rva2VuIH0gPSBhd2FpdCByZXNwb25zZS5qc29uKClcblxuXHRyZXR1cm4geyBhY2Nlc3NfdG9rZW4gfVxufVxuIl0sIm5hbWVzIjpbInJlcSIsImNvZGUiLCJqc29uIiwicmVzcG9uc2UiLCJmZXRjaCIsIm1ldGhvZCIsImhlYWRlcnMiLCJib2R5IiwiVVJMU2VhcmNoUGFyYW1zIiwiY2xpZW50X2lkIiwicHJvY2VzcyIsImVudiIsIlZJVEVfRElTQ09SRF9DTElFTlRfSUQiLCJjbGllbnRfc2VjcmV0IiwiRElTQ09SRF9DTElFTlRfU0VDUkVUIiwiZ3JhbnRfdHlwZSIsImFjY2Vzc190b2tlbiJdLCJyYW5nZU1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsIm1hcHBpbmdzIjoiQUFNQSxlQUFlLENBQUEsT0FBT0E7SUFDckIsTUFBTSxFQUFFQyxJQUFJLEVBQUUsR0FBSSxNQUFNRCxJQUFJRSxJQUFJO0lBRWhDLHdDQUF3QztJQUN4QyxNQUFNQyxXQUFXLE1BQU1DLE1BQU0sQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFO1FBQ3BFQyxRQUFRO1FBQ1JDLFNBQVM7WUFDUixnQkFBZ0I7UUFDakI7UUFDQUMsTUFBTSxJQUFJQyxnQkFBZ0I7WUFDekJDLFdBQVdDLFFBQVFDLEdBQUcsQ0FBQ0Msc0JBQXNCO1lBQzdDQyxlQUFlSCxRQUFRQyxHQUFHLENBQUNHLHFCQUFxQjtZQUNoREMsWUFBWTtZQUNaZCxNQUFNQTtRQUNQO0lBQ0Q7SUFDQSxNQUFNLEVBQUVlLFlBQVksRUFBRSxHQUFHLE1BQU1iLFNBQVNELElBQUk7SUFFNUMsT0FBTztRQUFFYztJQUFhO0FBQ3ZCLENBQUEsRUFBQyJ9