import GreenAudioPlayer from "./main";

describe("GreenAudioPlayer", () => {
  let player;

  beforeEach(() => {
    // Mock HTML elements
    document.createElement = jest.fn((tag) => {
      if (tag === "a") {
        return { setAttribute: jest.fn() };
      }
      return {
        style: {},
        classList: { add: jest.fn(), remove: jest.fn() },
        getBoundingClientRect: jest.fn(),
      };
    });

    window.innerHeight = 300;

    player = new GreenAudioPlayer();
  });

  test("showDownload should make download visible", () => {
    player.showDownload();
    expect(player.download.style.display).toBe("block");
  });

  test("downloadAudio should set download link attributes", () => {
    player.player = { currentSrc: "http://example.com/audio.mp3" };
    player.downloadAudio();
    expect(player.downloadLink.setAttribute).toHaveBeenCalledWith(
      "href",
      "http://example.com/audio.mp3"
    );
    expect(player.downloadLink.setAttribute).toHaveBeenCalledWith(
      "download",
      "audio.mp3"
    );
  });

  test("directionAware should set volumeControls class based on window height and audioPlayer position", () => {
    player.audioPlayer = { getBoundingClientRect: () => ({ top: 200 }) };
    player.directionAware();
    expect(player.volumeControls.classList.add).toHaveBeenCalledWith("top");
    expect(player.volumeControls.classList.remove).toHaveBeenCalledWith(
      "top",
      "middle",
      "bottom"
    );

    window.innerHeight = 200;
    player.directionAware();
    expect(player.volumeControls.classList.add).toHaveBeenCalledWith("middle");

    player.audioPlayer = { getBoundingClientRect: () => ({ top: 100 }) };
    player.directionAware();
    expect(player.volumeControls.classList.add).toHaveBeenCalledWith("bottom");
  });
});
