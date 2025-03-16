
interface ProfileTraitsProps {
  traits: string[];
}

const ProfileTraits = ({ traits }: ProfileTraitsProps) => {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Caractéristiques de votre profil</h4>
      <ul className="space-y-2">
        {traits.map((trait, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
              •
            </div>
            <span>{trait}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileTraits;
