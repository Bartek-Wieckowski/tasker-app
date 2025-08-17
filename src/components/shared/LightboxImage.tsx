import Lightbox, { SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type LightboxImageProps = {
  open: boolean;
  onClose: () => void;
  slides: SlideImage[];
};

const LightboxImage = ({ open, onClose, slides }: LightboxImageProps) => {
  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      carousel={{ finite: slides.length <= 1 }}
      render={{
        buttonPrev: slides.length <= 1 ? () => null : undefined,
        buttonNext: slides.length <= 1 ? () => null : undefined,
      }}
    />
  );
};

export default LightboxImage;
