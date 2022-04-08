import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import { AppUser, Post } from "../../interfaces/data-model";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { GetServerSidePropsContext } from "next";

export async function getServerSideProps(props: GetServerSidePropsContext) {
  const {
    query: { username },
  } = props;

  const userDoc = await getUserWithUsername(
    Array.isArray(username) ? username[0] : username ?? ""
  );

  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postsCollectionRef = collection(firestore, userDoc.ref.path, "posts");
    const postsFilter = where(
      "published",
      "==",
      // TODO: update to true once form fixed
      false /** false showns unpublished */
    );
    const q = query(
      postsCollectionRef,
      postsFilter,
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    posts = querySnapshot.docs.map(postToJSON);
  }

  return {
    props: { user, posts }, // will be passed to the page component as props
  };
}

interface UserProfilePageProps {
  user: AppUser;
  posts: Post[];
}

export default function UserProfilePage({ user, posts }: UserProfilePageProps) {
  console.log({ comp: "UserProfilePage", user, posts });
  return (
    <div>
      UserProfilePage
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </div>
  );
}
