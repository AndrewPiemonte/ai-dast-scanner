import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function NewTestCard() {
    const [url, setUrl] = useState("");
    const [testName, setTestName] = useState("");
    const router = useRouter()
    const goToDislayPage = () => {
        sessionStorage.setItem('url', url);
        if (testName !== ""){
            sessionStorage.setItem('testName', testName);
        } else{
            sessionStorage.setItem('testName', "My First Test");
        }
        
        router.push("/display");
      }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-3xl"> Submit a New Web App Test Using DAST Tools </CardTitle>
                <br></br>
                <CardDescription>
                    Please enter your Web Application URL for testing
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                    <Label>Test Name</Label>
                        <Input
                            placeholder="Enter your URL here"
                            value={testName}
                            onChange={(e) => { setTestName(e.target.value) }}
                            required
                        />
                        <Label>URL</Label>
                        <Input
                            placeholder="Enter your URL here"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value) }}
                            required
                        />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle> Please confirm your URL address </DialogTitle>
                                <DialogDescription>
                                    Confirm changes to your url address here, after this, the form will be submitted to the backend
                                </DialogDescription>
                            </DialogHeader>



                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        URL
                                    </Label>
                                    <Input
                                        defaultValue={url}
                                        className="col-span-3"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Button variant="link">
                                    <a href={url} target="_blank" rel="noopener noreferrer" >
                                        Link to the URL
                                    </a>
                                </Button>

                            </div>


                            <DialogFooter>
                                <Button type="submit" onClick={goToDislayPage}> Submit</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>

            </CardContent>
        </Card>
    )
}
