<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Course editing uses protected server functions with a database role check before privileged writes; client visibility is not authorization.
- Store draft course documents separately from public catalogue and authenticated video content; publishing validates all Drive videos server-side and commits the published snapshot atomically.
- Validate Drive files through the linked workspace Google Drive connector; require video MIME type and anyone-reader sharing for student playback.
- Student and admin draft previews share a lesson player; preview validates the current draft through an admin-role-checked server function without saving or changing published content.
