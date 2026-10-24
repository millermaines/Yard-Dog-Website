# Google Business Profile posts (Tuesdays and Saturdays)

A scheduled task posts one real job to the Yard Dog Google Business Profile every Tuesday and Saturday morning.
Miller set this up on 2026-10-23 and chose: **post automatically** (no approval step), **Tuesday and Saturday**.
Each post shows a real photo from a job, says what was done and in which town, and has a **Learn more** button that
opens that job's project page on the site.

## 0. Set up

1. Repo: `millermaines/Yard-Dog-Website`. If `/home/claude/yard-dog-website` is missing, attach it with `add_repo`
   (access `push`) and clone it there. `git checkout main && git pull`.
2. Read `CLAUDE.md`, `_data/projects.json` and `_data/gbp_posts.json` (the log of what has been posted).

## 1. Pick the job and the photos

Miller's rule (2026-10-24): **posts use a handful of the cameraman's professional photos, never screenshots or
stills pulled from a video.** Several photos go on every post, stacked in the post's photo set.

- Order of preference: a project that has never been posted, newest first (`date` in `projects.json`); then the
  project posted longest ago. Never the same project as the last post. Skip a job that has no professional photos.
- Photos: **4 to 6** original camera files (`DSC*.jpg`, drone `DJI*.jpg`) from that job's Drive folders, listed under
  the project's `drive.photo_folders` in `projects.json`. Prefer the sets the team already picked for social posts
  (for example `9Carousel Post (Flagstone)` or `Post Check (Irrigation & SOD Job)` under Social Media), then the
  job's `Project (...)` folder. None used in an earlier post (`gbp_posts.json`). Download them with the Drive
  connector (each is under 10 MB).
- Look at every one. Sharp, real, the crew or the work in frame. No license plates, house numbers or faces of
  customers. Lead with the strongest wide shot (an aerial or the whole area), then the hands-on shots in build order.
- Export each as JPG, long side 2048 px, quality 88, original aspect ratio (no cropping). Name them
  `<project slug>-<n>-<original name>.jpg`.

## 2. Write the post

- 450 to 900 characters, plain sentences in the voice of the site. Open with the town and what was built, since the
  first line shows in the preview. Example opening: "New flagstone patio by the pool in Hallsville, TX."
- Then say what went into it, from the project page (steps and materials). End with one line that sends people to
  the job: "See the video and every photo from this job on our site."
- Only facts from the project page. No customer names or addresses, no prices, no phone number (Google rejects
  posts with phone numbers it can't verify), no links in the text, no hashtags, at most one emoji. Don't repeat an
  earlier post's wording.
- Button: **Learn more** with the URL
  `https://www.yarddoglandscapes.com/our-work/<slug>?utm_source=google&utm_medium=organic&utm_campaign=gbp_post`.
- Read it back for spelling and facts before posting.

## 3. Post it (Claude in Chrome on Miller's Mac, Google account info@yarddoglandscapes.com)

1. Put the JPGs where Chrome can upload them: write them to `/mnt/user-data/outputs/yd-gbp/`, `device_commit_files`
   them to `~/Downloads/yd-gbp/` on his Mac, then `device_stage_files` those paths. Upload from the staged paths it
   returns (`/mnt/user-data/uploads/Downloads/yd-gbp/<name>.jpg`). Other paths are refused by the upload tool.
2. Open a new tab at `https://business.google.com/locations?authuser=info@yarddoglandscapes.com`. In the Yard Dog
   Landscapes row, click **Create post**. The editor opens in a frame the tools can't see into, so move the tab onto
   it: run `location.href=[...document.querySelectorAll('iframe')].find(f=>f.src.includes('/local/business/')).src`
   with the JavaScript tool. The "Add post" editor now fills the tab.
3. Keep **Update** selected. Type the text into Description. Use `find` to get the file input next to
   "Select images and videos" and `file_upload` all the staged JPGs in one call (keep the total under 10 MB).
   Check the previews: every photo there, the lead photo first.
4. Click **+ Button**, choose **Learn more** in the dropdown, and paste the URL into the field that appears.
5. Screenshot the whole editor and check it once more, then click **Post**. Wait for it to confirm.
6. Open the profile (`See your profile` / Updates) and confirm the post shows, live or pending review. Close your tab.

If anything is off (sign-in wall, CAPTCHA, the post is rejected, the editor looks different), stop. Don't retry in
a loop. Report what happened.

## 4. Log it

Add an entry to `_data/gbp_posts.json` `posts`: `date`, `project` (slug), `photos` (the original Drive file names),
`text`, `url`. Commit "GBP post: <project title>" to `main` and push.

## 5. Report

One or two lines to Miller: what was posted (project and town) and that it's live or waiting on Google's review.

## Never

Change anything else on the profile (name, phone, hours, categories, services, description, photos section),
reply to or touch reviews, delete or edit old posts, enter a password, get past a CAPTCHA, use the phone number
anywhere in a post, post a photo that isn't real Yard Dog work, or use a still or screenshot from a video.
