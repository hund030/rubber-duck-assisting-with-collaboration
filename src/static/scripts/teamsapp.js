(async function () {
  "use strict";

  // Call the initialize API first
  microsoftTeams.app.initialize().then(() => {
    microsoftTeams.app.notifySuccess();
    // Handle save for configurable tab.
    microsoftTeams.pages.config.registerOnSaveHandler((saveEvent) => {
      const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
      const configPromise = microsoftTeams.pages.config.setConfig({
        suggestedDisplayName: "Rubber Duck",
        entityId: baseUrl,
        contentUrl: baseUrl + "/tab",
        websiteUrl: baseUrl + "/tab",
      });
      configPromise
        .then((result) => {
          saveEvent.notifySuccess();
        })
        .catch((error) => {
          saveEvent.notifyFailure("failure message");
        });
    });
    microsoftTeams.pages.config.setValidityState(true);
  });
})();
