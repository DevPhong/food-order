"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccountProfile, useUpdateMeMutation } from "@/queries/useAccount";
import mediaApiRequest from "@/apiRequest/media";
import { handleErrorApi } from "@/lib/utils";
import { toast } from "sonner";

export default function UpdateProfileForm() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { data, refetch } = useAccountProfile();
  const updateMeMutation = useUpdateMeMutation();
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data;
      form.reset({
        name,
        avatar: avatar ?? undefined,
      });
    }
  }, [data, form]);

  const avatar = form.watch("avatar");
  const name = form.watch("name");

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const reset = () => {
    setFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    // Reset về data gốc thay vì empty values
    if (data) {
      const { name, avatar } = data.payload.data;
      form.reset({
        name,
        avatar: avatar ?? undefined,
      });
    } else {
      form.reset();
    }
  };

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return;
    try {
      let body = values;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadedAvatar = await mediaApiRequest.upload(formData);
        const imageUrl = uploadedAvatar.payload.data;
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      const result = await updateMeMutation.mutateAsync(body);
      toast.success(result.payload.message);
      setFile(null); // Clear file sau khi upload thành công
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      refetch();
    } catch (error) {
      if (error) {
        handleErrorApi({
          error,
          setError: form.setError,
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setFile(selectedFile);
                            // Không cần set placeholder URL, sẽ được set khi submit
                          }
                        }}
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=" items-center gap-2 md:ml-auto flex">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={reset}
                  disabled={updateMeMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={updateMeMutation.isPending}
                >
                  {updateMeMutation.isPending ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
