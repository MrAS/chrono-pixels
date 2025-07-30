import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  Loader2,
  ChevronDown,
  Edit3,
  Heart,
  Trash2,
  Download
} from 'lucide-react';

interface MainContentProps {
  activeSection: string;
}

interface GeneratedImage {
  id: string;
  image_url: string;
  title?: string;
  prompt?: string;
  operation_type: string;
  is_favorite: boolean;
  created_at: string;
}

const MainContent = ({ activeSection }: MainContentProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user images
  const loadImages = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading images",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setImages(data || []);
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  // Upload image to ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', 'YOUR_IMGBB_API_KEY'); // We'll need to set this up

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to upload image');
    }

    return data.data.url;
  };

  // Generate image using Pollinations.ai
  const generateImage = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      // Use Pollinations.ai API for image generation
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`;
      
      // Save to database
      const { data, error } = await supabase
        .from('images')
        .insert([{
          user_id: user.id,
          prompt: prompt,
          image_url: imageUrl,
          operation_type: 'generate',
          title: `Generated: ${prompt.slice(0, 50)}...`
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Image generated!",
        description: "Your AI-generated image is ready.",
      });

      setPrompt('');
      loadImages();
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload selected image
  const uploadImage = async () => {
    if (!selectedImage || !user) return;

    setLoading(true);
    try {
      // For now, we'll use a placeholder URL since ImgBB requires API key
      const imageUrl = URL.createObjectURL(selectedImage);
      
      const { data, error } = await supabase
        .from('images')
        .insert([{
          user_id: user.id,
          image_url: imageUrl,
          operation_type: 'upload',
          title: selectedImage.name
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Image uploaded!",
        description: "Your image has been saved to the gallery.",
      });

      setSelectedImage(null);
      loadImages();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (imageId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from('images')
      .update({ is_favorite: !currentFavorite })
      .eq('id', imageId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      loadImages();
    }
  };

  // Delete image
  const deleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Image deleted",
        description: "Image removed from your gallery.",
      });
      loadImages();
    }
  };

  const renderGenerateContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">Generate images with text prompts</h2>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] bg-input border-border"
        />
        <Button 
          onClick={generateImage}
          disabled={!prompt.trim() || loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Image
        </Button>
      </div>

      <div className="text-center text-muted-foreground">
        <p>Or start from a preset ↓</p>
      </div>
    </div>
  );

  const renderEditContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">Edit images with text instructions</h2>
      </div>

      <div 
        {...getRootProps()} 
        className={`
          flux-border-dashed p-12 text-center cursor-pointer flux-transition
          ${isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg mb-2">
          {selectedImage ? selectedImage.name : 'Drag and drop an image'}
        </p>
        {!selectedImage && (
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        )}
      </div>

      {selectedImage && (
        <div className="space-y-4">
          <Textarea
            placeholder="Describe how you want to edit the image..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-input border-border"
          />
          <Button 
            onClick={uploadImage}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload & Edit
          </Button>
        </div>
      )}

      <div className="text-center text-muted-foreground">
        <p>Or start from a preset ↓</p>
      </div>
    </div>
  );

  const renderImageGallery = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Your Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img 
                src={image.image_url} 
                alt={image.title || 'Generated image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleFavorite(image.id, image.is_favorite)}
                >
                  <Heart className={`h-4 w-4 ${image.is_favorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={() => deleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">{image.title}</p>
              {image.prompt && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {image.prompt}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const getContent = () => {
    switch (activeSection) {
      case 'generate':
        return renderGenerateContent();
      case 'edit':
        return renderEditContent();
      case 'fill':
      case 'expand':
        return renderEditContent(); // For now, use same interface
      case 'history':
        return renderImageGallery();
      case 'favorites':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Favorite Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.filter(img => img.is_favorite).map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={image.image_url} 
                      alt={image.title || 'Generated image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.title}</p>
                    {image.prompt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {image.prompt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium">Account Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Email: {user?.email}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since: {user && new Date(user.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderGenerateContent();
    }
  };

  // Load images when component mounts or user changes
  useEffect(() => {
    loadImages();
  }, [user]);

  return (
    <div className="flex-1 p-6 overflow-auto">
      {getContent()}
    </div>
  );
};

export default MainContent;