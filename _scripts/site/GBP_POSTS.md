# Google Business Profile posts (Tuesdays and Saturdays)

A scheduled task posts one real job to the Yard Dog Google Business Profile every Tuesday and Saturday morning.
Miller set this up on 2026-10-23 and chose: **post automatically** (no approval step), **Tuesday and Saturday**.
Each post shows a real photo from a job, says what was done and in which town, and has a **Learn more** button that
opens that job's project page on the site.

## 0. Set up

1. Repo: `millermaines/Yard-Dog-Website`. If `/home/claude/yard-dog-website` is missing, attach it with `add_repo`
   (access `push`) and clone it there. `git checkout main && git pull`.
2. Read `CLAUDE.md`, `_data/projects.json` and `_data/gbp_posts.json` (the log of what has been posted).

## 1. Pick the job and the photo

- Order of preference: a project page that has never been posted, newest first (`date` in `projects.json`); then
  the project posted longest ago. Never the same project as the last post.
- Photo: one from that job in `img/work/full/` (look it up by `job` in `_data/project_photos.json` or
  `_data/photos.json`), not used in any earlier post. Prefer a finished shot; a strong crew-at-work shot is fine.
  Look at it first. It must be sharp, real, and show the work. Never a rendering, never an AI image.
- Make a JPG for Google: 1200 x 900 (4:3), cropped so the work stays in frame, quality 85, under 2 MB.
  Landscape photos crop best. If a portrait photo loses the work at 4:3, pick another photo. Look at the crop.
  Name it like `<project slug>-gbp-YYYYMMDD.jpg`.

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

1. Put the JPG where Chrome can upload it: write it to `/mnt/user-data/outputs/yd-gbp/`, `device_commit_files` it to
   `~/Downloads/yd-gbp/<name>.jpg` on his Mac, then `device_stage_files` that path. Upload from the staged path it
   returns (`/mnt/user-data/uploads/Downloads/yd-gbp/<name>.jpg`). Other paths are refused by the upload tool.
2. Open a new tab at `https://business.google.com/locations?authuser=info@yarddoglandscapes.com`. In the Yard Dog
   Landscapes row, click **Create post**. The editor opens in a frame the tools can't see into, so move the tab onto
   it: run `location.href=[...document.querySelectorAll('iframe')].find(f=>f.src.includes('/local/business/')).src`
   with the JavaScript tool. The "Add post" editor now fills the tab.
3. Keep **Update** selected. Type the text into Description. Use `find` to get the file input next to
   "Select images and videos" and `file_upload` the staged JPG. Check the preview.
4. Click **+ Button**, choose **Learn more** in the dropdown, and paste the URL into the field that appears.
5. Screenshot the whole editor and check it once more, then click **Post**. Wait for it to confirm.
6. Open the profile (`See your profile` / Updates) and confirm the post shows, live or pending review. Close your tab.

If anything is off (sign-in wall, CAPTCHA, the post is rejected, the editor looks different), stop. Don't retry in
a loop. Report what happened.

## 4. Log it

Add an entry to `_data/gbp_posts.json` `posts`: `date`, `project` (slug), `photo` (the `img/work/full` file name),
`text`, `url`. Commit "GBP post: <project title>" to `main` and push.

## 5. Report

One or two lines to Miller: what was posted (project and town) and that it's live or waiting on Google's review.

## Never

Change anything else on the profile (name, phone, hours, categories, services, description, photos section),
reply to or touch reviews, delete or edit old posts, enter a password, get past a CAPTCHA, use the phone number
anywhere in a post, or post a photo that isn't real Yard Dog work.
